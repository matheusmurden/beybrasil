import { getSession } from "~/sessions.server";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect, useActionData } from "react-router";
import type { Route } from "./+types/Tournament";
import { useNavContext } from "~/contexts";
import { useEffect } from "react";
import {
  TournamentStateEnum,
  type EventObj,
  type LeagueObj,
  type Standing,
  type TournamentObj,
  type User,
} from "~/types";
import { Form } from "react-router";
import {
  Accordion,
  Avatar,
  Button,
  Card,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  Pill,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useOutletContext } from "react-router";
import classNames from "classnames";
import classes from "./Tournament.module.css";
import { isUserInEvent } from "~/helpers";
import { Table } from "@mantine/core";

import { useColorScheme } from "@mantine/hooks";
import { RANKING_POINTS_BY_PLACEMENT } from "~/consts";

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
              entrants(query: { perPage: 100 }) {
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

  const navigate = useNavigate();
  const location = useLocation();
  const { league, allRankedLeagueEvents, ranking, currentUser } =
    useOutletContext<{
      league: LeagueObj;
      allRankedLeagueEvents: number[];
      ranking: Standing[];
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

  const colorScheme = useColorScheme();
  return (
    <Modal
      className={classNames(classes.Modal)}
      title={
        <h2 className="text-lg font-bold">[Resultados] - {tournament?.name}</h2>
      }
      opened
      onClose={() => navigate(location.pathname.split("/tournament")[0])}
    >
      <Modal.Body className="p-4">
        {tournament &&
        [TournamentStateEnum.COMPLETED, TournamentStateEnum.ACTIVE].includes(
          tournament.state,
        ) ? (
          <div className="flex flex-col gap-8">
            <Accordion
              className="p-0"
              defaultValue={String(
                tournament?.events.sort(sortByRanked)[0]?.id,
              )}
            >
              {tournament?.events?.sort(sortByRanked)?.map((event) => (
                <Accordion.Item key={event.id} value={String(event.id)}>
                  <Accordion.Control className="hover:bg-gray-200 dark:hover:bg-neutral-500 dark:bg-neutral-600">
                    <h3 className="dark:text-neutral-300">{event.name}</h3>
                  </Accordion.Control>
                  {event?.standings?.nodes?.length > 0 ? (
                    <Accordion.Panel>
                      <Table
                        className="hidden lg:table"
                        stickyHeader
                        stickyHeaderOffset={60}
                        highlightOnHover
                        highlightOnHoverColor={
                          colorScheme === "dark" ? "dark" : undefined
                        }
                      >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th className="text-center">Posição</Table.Th>
                            <Table.Th>Blader</Table.Th>
                            <Table.Th className="text-center">
                              Vitórias
                            </Table.Th>
                            <Table.Th className="text-center">
                              Derrotas
                            </Table.Th>
                            {allRankedLeagueEvents?.includes(event?.id) && (
                              <>
                                <Table.Th className="text-center">
                                  Ganhou Pontos Ranqueados
                                </Table.Th>
                                <Table.Th className="text-center">
                                  Pontuação Ranqueada Atual
                                </Table.Th>
                                <Table.Th className="text-center">
                                  Posicão Atual no Ranking
                                </Table.Th>
                              </>
                            )}
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {event?.standings?.nodes.map((standing) => (
                            <Table.Tr key={standing?.id}>
                              <Table.Td
                                className={classNames("text-center", {
                                  "flex flex-col items-center justify-center":
                                    currentUser?.id ===
                                      standing?.player?.user?.id ||
                                    standing?.entrant?.team?.members?.find(
                                      (member) =>
                                        member?.player?.user?.id ===
                                        currentUser?.id,
                                    ),
                                })}
                              >
                                #{standing?.placement}
                                {currentUser?.id ===
                                  standing?.player?.user?.id ||
                                standing?.entrant?.team?.members?.find(
                                  (member) =>
                                    member?.player?.user?.id ===
                                    currentUser?.id,
                                ) ? (
                                  <Pill className="bg-violet-600 dark:bg-violet-300">
                                    <span className="text-neutral-200">
                                      Você
                                    </span>
                                  </Pill>
                                ) : (
                                  <></>
                                )}
                              </Table.Td>
                              <Table.Td className="overflow-hidden text-ellipsis w-fit max-w-full">
                                <div className="flex gap-2 items-center w-full">
                                  <Avatar
                                    className="cursor-pointer"
                                    name={
                                      standing?.player?.gamerTag ??
                                      standing?.entrant?.team?.name
                                    }
                                    src={
                                      standing?.player?.user?.images?.find(
                                        (image) => image?.type === "profile",
                                      )?.url ??
                                      standing?.entrant?.team?.images?.find(
                                        (image) => image?.type === "profile",
                                      )?.url ??
                                      ""
                                    }
                                    alt={
                                      standing?.player?.gamerTag ??
                                      standing?.entrant?.team?.name
                                    }
                                  />
                                  <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                                    {standing?.player?.prefix ? (
                                      <span className="text-neutral-500 dark:text-neutral-400">
                                        {standing?.player?.prefix} |{" "}
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                    <span>
                                      {standing?.player?.gamerTag ??
                                        standing?.entrant?.name}
                                    </span>
                                  </p>
                                </div>
                              </Table.Td>
                              <Table.Td className="text-center">
                                {standing.setRecordWithoutByes?.wins}
                              </Table.Td>
                              <Table.Td className="text-center">
                                {standing.setRecordWithoutByes?.losses}
                              </Table.Td>
                              {allRankedLeagueEvents?.includes(event?.id) && (
                                <>
                                  <Table.Td className="text-center">
                                    {RANKING_POINTS_BY_PLACEMENT?.[
                                      standing?.placement
                                    ]
                                      ? `+${
                                          RANKING_POINTS_BY_PLACEMENT?.[
                                            standing?.placement
                                          ]
                                        }`
                                      : "+10"}
                                  </Table.Td>
                                  <Table.Td className="text-center">
                                    {
                                      ranking?.find(
                                        (i) =>
                                          i?.player?.user?.id ===
                                          standing?.player?.user?.id,
                                      )?.totalPoints
                                    }
                                  </Table.Td>
                                  <Table.Td className="text-center">
                                    #
                                    {
                                      ranking?.find(
                                        (i) =>
                                          i?.player?.user?.id ===
                                          standing?.player?.user?.id,
                                      )?.placement
                                    }
                                  </Table.Td>
                                </>
                              )}
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                      <Card
                        shadow="lg"
                        className="block lg:hidden dark:bg-neutral-700"
                      >
                        {event?.standings?.nodes?.map((standing) => (
                          <Card
                            my={12}
                            shadow="sm"
                            withBorder
                            className={classNames(
                              "p-6 dark:bg-neutral-800 dark:border-neutral-600",
                              {
                                ["border-violet-600 dark:border-violet-300"]:
                                  currentUser?.id ===
                                    standing?.player?.user?.id ||
                                  standing?.entrant?.team?.members?.find(
                                    (member) =>
                                      member?.player?.user?.id ===
                                      currentUser?.id,
                                  ),
                              },
                            )}
                            key={standing?.id}
                          >
                            <div className="flex flex-col gap-6 items-start justify-center">
                              <div
                                className={classNames(
                                  "items-center justify-start w-full",
                                  classes.CardTitle,
                                )}
                              >
                                <span
                                  className={classNames(
                                    "leading-tight block w-full",
                                    {
                                      "text-amber-500 text-xl font-bold ":
                                        standing?.placement === 1,
                                      "text-gray-400 text-xl font-bold ":
                                        standing?.placement === 2,
                                      "text-amber-700 text-xl font-bold ":
                                        standing?.placement === 3,
                                      "text-violet-600 dark:text-violet-300 font-bold ":
                                        currentUser?.id ===
                                          standing?.player?.user?.id ||
                                        standing?.entrant?.team?.members?.find(
                                          (member) =>
                                            member?.player?.user?.id ===
                                            currentUser?.id,
                                        ),
                                      "text-neutral-400 dark:text-neutral-500 text-sm font-medium":
                                        standing?.placement > 3,
                                    },
                                  )}
                                >
                                  #{standing?.placement}
                                </span>
                                <div className="flex gap-2 items-center">
                                  <Avatar
                                    className="cursor-pointer"
                                    name={
                                      standing?.player?.gamerTag ??
                                      standing?.entrant?.team?.name
                                    }
                                    src={
                                      standing?.player?.user?.images?.find(
                                        (image) => image?.type === "profile",
                                      )?.url ??
                                      standing?.entrant?.team?.images?.find(
                                        (image) => image?.type === "profile",
                                      )?.url ??
                                      ""
                                    }
                                    alt={
                                      standing?.player?.gamerTag ??
                                      standing?.entrant?.team?.name
                                    }
                                  />
                                  <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                                    {standing?.player?.prefix ? (
                                      <span className="text-neutral-500 dark:text-neutral-400">
                                        {standing?.player?.prefix} |{" "}
                                      </span>
                                    ) : (
                                      ""
                                    )}
                                    <span>
                                      {standing?.player?.gamerTag ??
                                        standing?.entrant?.team?.name}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div
                                className={classNames(
                                  "w-full",
                                  classes.CardInfo,
                                )}
                              >
                                <div className="leading-tight flex flex-col justify-between gap-2">
                                  <label className="text-xs text-neutral-500 font-mono tracking-tighter">
                                    Vitórias
                                  </label>
                                  <span className="font-medium">
                                    {standing.setRecordWithoutByes?.wins}
                                  </span>
                                </div>
                                <div className="leading-tight flex flex-col justify-between gap-2">
                                  <label className="text-xs text-neutral-500 font-mono tracking-tighter">
                                    Derrotas
                                  </label>
                                  <span className="font-medium">
                                    {standing.setRecordWithoutByes?.losses}
                                  </span>
                                </div>
                                {allRankedLeagueEvents?.includes(event?.id) && (
                                  <>
                                    <div className="leading-tight flex flex-col justify-between gap-2">
                                      <label className="text-xs text-neutral-500 font-mono tracking-tighter">
                                        Ganhou Pts.
                                      </label>
                                      <span className="font-medium">
                                        {RANKING_POINTS_BY_PLACEMENT?.[
                                          standing?.placement
                                        ]
                                          ? `+${
                                              RANKING_POINTS_BY_PLACEMENT?.[
                                                standing?.placement
                                              ]
                                            }`
                                          : "+10"}
                                      </span>
                                    </div>
                                    <div className="leading-tight flex flex-col justify-between gap-2">
                                      <label className="text-xs text-neutral-500 font-mono tracking-tighter">
                                        Ranking Atual
                                      </label>
                                      <span className="font-medium">
                                        #
                                        {
                                          ranking?.find(
                                            (i) =>
                                              i?.player?.user?.id ===
                                              standing?.player?.user?.id,
                                          )?.placement
                                        }
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </Card>
                    </Accordion.Panel>
                  ) : (
                    <p>Ainda não há resultados para este evento.</p>
                  )}
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
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
      </Modal.Body>
    </Modal>
  );
}
