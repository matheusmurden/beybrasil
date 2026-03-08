import { getSession } from "~/sessions.server";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect, useActionData } from "react-router";
import type { Route } from "./+types/Tournament";
import { useNavContext } from "~/contexts";
import { useEffect } from "react";
import {
  TournamentStateEnum,
  type LeagueObj,
  type TournamentObj,
  type User,
} from "~/types";
import { Form } from "react-router";
import { Button, Checkbox, CheckboxGroup, Input } from "@mantine/core";
import { useOutletContext } from "react-router";
import classNames from "classnames";
import classes from "./Tournament.module.css";
import { isUserInEvent } from "~/helpers";
import { EventList } from "~/components";
import { isBefore } from "date-fns";
import { TZDate } from "@date-fns/tz";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const allValidLeagueSlugs = Object.entries(manualContent).filter(([, val]) =>
    Object.hasOwn(val, "league"),
  );
  if (
    !allValidLeagueSlugs.some(([key]) => key === params.acronym.toLowerCase())
  ) {
    return redirect("/404");
  }
  try {
    const tournamentResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          tournament(slug: "${params?.tournamentSlug}") {
            id
            name
            slug
            startAt
            state
            isRegistrationOpen
            eventRegistrationClosesAt
            events(limit: 20) {
              id
              slug
              name
              numEntrants
            }
            admins {
              player {
                gamerTag
                user {
                  id
                }
              }
            }
            participants(query: {
              perPage: 512,
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
          }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const eventsResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          tournament(slug: "${params?.tournamentSlug}") {
            events(limit: 20) {
              id
              slug
              name
              numEntrants
              state
              startAt
              entryFee
              prizingInfo
              rulesMarkdown
              standings(query: { perPage: 100 }) {
                nodes {
                  placement
                  totalPoints
                  setRecordWithoutByes
                  entrant {
                    id
                    name
                    team {
                      id
                      name
                      members {
                        player {
                          user {
                            id
                          }
                        }
                      }
                      images {
                        url
                        type
                      }
                    }
                  }
                  player {
                    id
                    gamerTag
                    prefix
                    user {
                      id
                      images(type: "profile") {
                        url
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const tournamentData: {
      data: {
        tournament: TournamentObj;
      };
    } = await tournamentResponse.json();

    const eventsData: {
      data: {
        tournament: TournamentObj;
      };
    } = await eventsResponse.json();

    return {
      tournament: {
        ...tournamentData?.data?.tournament,
        ...eventsData?.data?.tournament,
      },
    };
  } catch (e) {
    console.log(e);
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = Number(formData.get("userId"));
  const eventIds: number[] = Array.from(formData?.entries())
    .map(([, val]) => Number(val))
    .filter((i) => i !== userId);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const allValidLeagueSlugs = Object.entries(manualContent).filter(([, val]) =>
    Object.hasOwn(val, "league"),
  );
  if (
    !allValidLeagueSlugs.some(([key]) => key === params.acronym.toLowerCase())
  ) {
    return redirect("/404");
  }

  try {
    const registrationTokenResponse = await fetch(
      "https://api.start.gg/gql/alpha",
      {
        method: "POST",
        body: JSON.stringify({
          query: `mutation GenerateRegistrationToken {
          generateRegistrationToken(
            registration: {
              eventIds: ${JSON.stringify(eventIds)},
            },
            userId: "${userId}",
          )
        }`,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const registrationTokenData: {
      data: { generateRegistrationToken: number };
    } = await registrationTokenResponse.json();

    const registrationToken =
      registrationTokenData?.data?.generateRegistrationToken;

    const registrationFormResponse = await fetch(
      "https://api.start.gg/gql/alpha",
      {
        method: "POST",
        body: JSON.stringify({
          query: `mutation RegisterForTournament {
            registerForTournament(
              registration: {
                eventIds: ${JSON.stringify(eventIds)},
              },
              registrationToken: "${registrationToken}",
            ) {
              id
              prefix
              gamerTag
              user {
                id
              }
            }
          }`,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const registrationFormData: {
      data: {
        registerForTournament: {
          id: number;
          user: {
            id: number;
            player: {
              prefix?: string;
              gamerTag: string;
            };
          };
        };
      };
    } = await registrationFormResponse?.json();

    return {
      status: registrationFormData?.data?.registerForTournament?.id ? 200 : 400,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function Tournament({ loaderData }: Route.ComponentProps) {
  const { setNavTitle } = useNavContext();

  const actionData = useActionData<{ status: 200 | 400 }>();

  const { league, allRankedLeagueEvents, currentUser } = useOutletContext<{
    league: LeagueObj;
    allRankedLeagueEvents: number[];
    currentUser: User | null;
  }>();

  const tournament = loaderData?.tournament;

  useEffect(() => {
    if (tournament?.name) {
      setNavTitle(tournament?.name);
    }
    return () => {
      setNavTitle("");
    };
  }, [tournament, setNavTitle]);

  const defaultValue = Array.from(
    new Set([
      ...(tournament?.events
        ?.filter((event) =>
          league?.events?.nodes?.some((node) => node.id === event.id),
        )
        .map((i) => i?.id) ?? []),
      ...(tournament?.events
        ?.filter((event) =>
          isUserInEvent({ userId: currentUser?.id ?? 0, event }),
        )
        ?.map((i) => i?.id) ?? []),
    ]),
  ).map((i) => String(i));

  const now = new TZDate(new Date(), "America/Sao_Paulo");

  const startsAt = new TZDate(
    (tournament?.eventRegistrationClosesAt ?? 0) * 1000,
    "America/Sao_Paulo",
  );

  return (
    <div className="py-24 pt-32">
      <div className="p-0">
        {tournament && isBefore(startsAt, now) ? (
          <EventList
            tournament={tournament}
            rankedEvents={allRankedLeagueEvents}
          />
        ) : (
          <>
            {!actionData?.status ? (
              <h3 className="text-(--accentColor) underline">
                Formulário de Inscrição{" "}
              </h3>
            ) : (
              <p>
                {actionData?.status === 200
                  ? "(Inscrição no torneio feita com sucesso)"
                  : actionData?.status === 400
                    ? "(Erro ao fazer inscrição no torneio)"
                    : ""}
              </p>
            )}
            <Form action={undefined} method="post">
              <CheckboxGroup
                defaultValue={defaultValue}
                label="Selecione os eventos que você quer participar"
                description="Eventos ranqueados são obrigatórios"
                withAsterisk
              >
                {tournament?.events?.map((event) => (
                  <Checkbox
                    key={`checkbox-${event.id}`}
                    name={String(event.id)}
                    value={String(event.id)}
                    label={event?.name}
                    required={allRankedLeagueEvents?.some(
                      (id) => Number(id) === event.id,
                    )}
                    className={classNames(
                      "mt-4 pointer-events-auto",
                      classes.Checkbox,
                      {
                        "pointer-events-none cursor-not-allowed":
                          allRankedLeagueEvents?.some(
                            (id) => Number(id) === event.id,
                          ),
                        [classes.Required]: allRankedLeagueEvents?.some(
                          (id) => Number(id) === event.id,
                        ),
                      },
                    )}
                  />
                ))}
              </CheckboxGroup>
              <Input name="userId" hidden value={currentUser?.id} />
              <Button className="mt-6" type="submit">
                {tournament?.events?.some((event) =>
                  isUserInEvent({ userId: currentUser?.id, event }),
                )
                  ? "Modificar Inscrição"
                  : "Enviar Inscrição"}
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
