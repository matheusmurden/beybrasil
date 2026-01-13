import { getSession } from "~/sessions.server";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect } from "react-router";
import type { Route } from "./+types/Tournament";
import { useNavContext, useUserContext } from "~/contexts";
import { useEffect } from "react";
import {
  TournamentStateEnum,
  type EventObj,
  type LeagueObj,
  type TournamentObj,
} from "~/types";
import { Form } from "react-router";
import {
  Accordion,
  Avatar,
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useOutletContext } from "react-router";
import classNames from "classnames";
import classes from "./Tournament.module.css";
import { isUserInEvent } from "~/helpers";
import { isAfter } from "date-fns";
import { Table } from "@mantine/core";

import { TZDate } from "@date-fns/tz";
import { useColorScheme } from "@mantine/hooks";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const allValidLeagueSlugs = Object.entries(manualContent).filter(([, val]) =>
    Object.hasOwn(val, "league"),
  );
  if (!token) {
    return redirect("/login");
  }
  if (
    !allValidLeagueSlugs.some(([key]) => key === params.acronym.toLowerCase())
  ) {
    return redirect("/404");
  }

  try {
    const response = await fetch("https://api.start.gg/gql/alpha", {
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
            unpaidParticipants: participants(query: {
              perPage: 512,
              filter: {
                unpaid: true
              }
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            paidParticipants: participants(query: {
              perPage: 512,
              filter: {
                unpaid: false
              }
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            allParticipants: participants(query: {
              perPage: 512,
            }) {
              nodes {
                gamerTag
                user {
                  id
                }
              }
            }
            events(limit: 20) {
              id
              standings(query: { perPage: 20 }) {
                nodes {
                  placement
                  totalPoints
                  setRecordWithoutByes
                  stats {
                    score {
                      value
                      label
                      displayValue
                    }
                  }
                  player {
                    id
                    gamerTag
                    prefix
                    user {
                      id
                      images {
                        url
                        type
                      }
                    }
                  }
                }
              }
              slug
              name
              numEntrants
              state
              startAt
              entryFee
              prizingInfo
              rulesMarkdown
              entrants {
                nodes {
                  id
                  name
                  participants {
                    id
                    user {
                      id
                    }
                  }
                }
              }
              images(type: "profile") {
                id
                url
                type
              }
              userEntrant {
                id
                name
                standing {
                  placement
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
    } = await response.json();

    return {
      tournament: tournamentData?.data?.tournament,
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
  if (!token) {
    return redirect("/login");
  }
  if (
    !allValidLeagueSlugs.some(([key]) => key === params.acronym.toLowerCase())
  ) {
    return redirect("/404");
  }

  try {
    const registrationToken = await fetch("https://api.start.gg/gql/alpha", {
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
    });

    const registrationTokenVal = await registrationToken.json();

    console.log(registrationTokenVal);

    return {
      status: 200,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function Tournament({ loaderData }: Route.ComponentProps) {
  const { setNavTitle } = useNavContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserContext();
  const { league, allRankedLeagueEvents } = useOutletContext<{
    league: LeagueObj;
    allRankedLeagueEvents: number[];
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
        ?.filter((event) => isUserInEvent({ userId: user?.id ?? 0, event }))
        ?.map((i) => i?.id) ?? []),
    ]),
  ).map((i) => String(i));

  const sortByRanked = (a: EventObj, b: EventObj) => {
    const indexA = allRankedLeagueEvents.indexOf(a.id);
    const indexB = allRankedLeagueEvents.indexOf(b.id);

    if (indexA === -1 && indexB === -1) {
      return 0; // Keep original order for items not in idOrder
    }
    if (indexA === -1) {
      return 1; // Items not in idOrder go to the end
    }
    if (indexB === -1) {
      return -1; // Items in idOrder come before those not in it
    }

    return indexA - indexB; // Both in idOrder, sort by their index
  };

  const value = useColorScheme();
  return (
    <Modal
      className={classes.Modal}
      title={
        <h2 className="text-lg font-bold">[Resultados] - {tournament?.name}</h2>
      }
      opened
      onClose={() => navigate(location.pathname.split("/tournament")[0])}
    >
      {/*<h3 className="text-(--accentColor) underline">
        Formulário de Inscrição
      </h3>
      <Form action={undefined} method="post">
        <CheckboxGroup
          defaultValue={defaultValue}
          label="Selecione os eventos que você quer participar"
          description="Eventos ranqueados são obrigatórios"
          withAsterisk
        >
          {tournament?.events?.map((event) => (
            <Checkbox
              key={event.id}
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
        <Input name="userId" hidden value={user?.id} />
        <Button className="mt-6" type="submit">
          Enviar Inscrição
        </Button>
      </Form>*/}

      {[TournamentStateEnum.COMPLETED, TournamentStateEnum.ACTIVE].includes(
        tournament!.state,
      ) && (
        <div className="flex flex-col gap-8">
          <Accordion
            className="p-0"
            defaultValue={String(tournament?.events.sort(sortByRanked)[0]?.id)}
          >
            {tournament?.events?.sort(sortByRanked)?.map((event) => (
              <Accordion.Item key={event.id} value={String(event.id)}>
                <Accordion.Control className="hover:bg-gray-200 dark:hover:bg-neutral-500 dark:bg-neutral-600">
                  <h3 className="dark:text-neutral-300">{event.name}</h3>
                </Accordion.Control>
                <Accordion.Panel>
                  <Table
                    highlightOnHover
                    highlightOnHoverColor={
                      value === "dark" ? "dark" : undefined
                    }
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th className="text-center">Posição</Table.Th>
                        <Table.Th>Blader</Table.Th>
                        <Table.Th className="text-center">Vitórias</Table.Th>
                        <Table.Th className="text-center">Derrotas</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {event?.standings?.nodes.map((standing) => (
                        <Table.Tr key={standing?.id}>
                          <Table.Td className="text-center">
                            #{standing?.placement}
                          </Table.Td>
                          <Table.Td>
                            <div className="flex gap-2 items-center">
                              <Avatar
                                className="cursor-pointer"
                                name={standing?.player?.gamerTag}
                                src={
                                  standing?.player?.user?.images?.find(
                                    (image) => image?.type === "profile",
                                  )?.url ?? ""
                                }
                                alt={standing?.player?.gamerTag}
                              />
                              {standing?.player?.prefix ? (
                                <span className="text-neutral-500 dark:text-neutral-400">
                                  {standing?.player?.prefix} |{" "}
                                </span>
                              ) : (
                                ""
                              )}
                              {standing?.player?.gamerTag}
                            </div>
                          </Table.Td>
                          <Table.Td className="text-center">
                            {standing.setRecordWithoutByes?.wins}
                          </Table.Td>
                          <Table.Td className="text-center">
                            {standing.setRecordWithoutByes?.losses}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      )}
    </Modal>
  );
}
