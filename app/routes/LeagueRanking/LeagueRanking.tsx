import manualContent from "~/assets/manualContent.json" with { type: "json" };
import {
  TournamentStateEnum,
  type EventObj,
  type LeagueLoaderReturnType,
  type LeagueObj,
} from "~/types";
import { Avatar, Card, Pill, Table } from "@mantine/core";
import { redirect } from "react-router";
import classes from "./LeagueRanking.module.css";
import { useColorScheme } from "@mantine/hooks";
import classNames from "classnames";
import { useOutletContext } from "react-router";
import { getSession } from "~/sessions.server";
import type { Route } from "./+types/LeagueRanking";
import { useNavContext } from "~/contexts";
import { useEffect } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const allValidLeagueSlugs = Object.entries(manualContent).filter(([, val]) =>
    Object.hasOwn(val, "league"),
  );
  if (
    !allValidLeagueSlugs.some(([key]) => key === params?.acronym?.toLowerCase())
  ) {
    return redirect("/404");
  }

  const leagueSlug = allValidLeagueSlugs
    ?.filter(
      ([key, val]) =>
        key === params?.acronym?.toLowerCase() && Object.hasOwn(val, "league"),
    )
    ?.flatMap((i) => i[1] as { league: string })[0]?.league;

  try {
    const standingsResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          league(slug: "${leagueSlug}") {
            name
            standings(query: { perPage: 150 }) {
              nodes {
                id
                placement
                totalPoints
                metadata
                player {
                  id
                  gamerTag
                  prefix
                  user {
                    id
                    images(type: "profile") {
                      id
                      url
                      type
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

    const eventsPageResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          league(slug: "${leagueSlug}") {
            name
            events(query: { perPage: 1 }) {
              pageInfo {
                total
                totalPages
                page
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

    const eventsPageData: { data: { league: LeagueObj } } =
      await eventsPageResponse.json();

    const promises = [];

    for (
      let i = 1;
      i <= (eventsPageData?.data?.league?.events?.pageInfo?.totalPages ?? 1);
      i++
    ) {
      promises.push(
        await fetch("https://api.start.gg/gql/alpha", {
          method: "POST",
          body: JSON.stringify({
            query: `{
            league(slug: "${leagueSlug}") {
              name
              events(query: { perPage: 1, page: ${i} }) {
                nodes {
                  id
                  tournament {
                    id
                    state
                    participants(query: {
                      perPage: 512,
                    }) {
                      nodes {
                        user {
                          id
                        }
                      }
                    }
                    events(limit: 20) {
                      id
                      name
                      state
                      entrants(query: { perPage: 512 }) {
                        nodes {
                          id
                          name
                          standing {
                           placement
                           player {
                            id
                              user {
                                id
                              }
                           }
                          }
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
        }).then(async (res) => {
          const result = await res.json();
          return result;
        }),
      );
    }

    // @ts-expect-error refactor later
    const eventsData: PromiseFulfilledResult<{
      data: { league: { events: { nodes: EventObj } } };
    }>[] = await Promise.allSettled(promises);
    const standingsData = await standingsResponse.json();

    const eventNodes = eventsData?.flatMap(
      (i) => i?.value?.data?.league?.events.nodes,
    );

    const rankingData = {
      data: {
        league: {
          ...standingsData?.data?.league,
          events: {
            nodes: eventNodes ?? [],
          },
        },
      },
    };

    const league: LeagueObj = rankingData?.data?.league;

    const ranking = league?.standings?.nodes;

    const allRankedLeagueEvents = league?.events?.nodes?.flatMap(
      (event) => event.id,
    );

    const tournamentsParticipants = league?.events?.nodes?.flatMap(
      (tournamentNode) =>
        tournamentNode?.tournament?.participants?.nodes
          ?.flatMap((i) => ({
            tournamentId: tournamentNode?.tournament?.id,
            userId: i?.user?.id,
            isOver:
              tournamentNode?.tournament?.state ===
              TournamentStateEnum.COMPLETED,
          }))
          ?.filter((i) => !!i?.userId && i?.isOver),
    );

    const tournamentCounts = tournamentsParticipants?.reduce(
      (acc: Record<number, Set<number>>, i) => {
        acc[i?.userId] ??= new Set<number>();
        acc[i?.userId].add(i?.tournamentId);
        return acc;
      },
      {},
    );

    const numberOfRankedPodiumsByUser = league?.events?.nodes?.flatMap(
      (rankedEventNode) =>
        rankedEventNode?.tournament?.events?.flatMap((eventNode) =>
          eventNode?.entrants?.nodes
            ?.flatMap((entrantNode) => ({
              rankedEventId: rankedEventNode.id,
              eventId: eventNode?.id,
              isPodium: Boolean((entrantNode?.standing?.placement ?? 4) < 4),
              userId: entrantNode?.standing?.player?.user?.id,
            }))
            ?.filter((i) => allRankedLeagueEvents?.includes(i?.eventId))
            ?.filter((i) => i?.isPodium),
        ),
    );

    const numberOfRankedVictoriesByUser = league?.events?.nodes?.flatMap(
      (rankedEventNode) =>
        rankedEventNode?.tournament?.events?.flatMap((eventNode) =>
          eventNode?.entrants?.nodes
            ?.flatMap((entrantNode) => ({
              rankedEventId: rankedEventNode.id,
              eventId: eventNode?.id,
              isVictory: Boolean((entrantNode?.standing?.placement ?? 0) === 1),
              userId: entrantNode?.standing?.player?.user?.id,
            }))
            ?.filter((i) => allRankedLeagueEvents?.includes(i?.eventId))
            ?.filter((i) => i?.isVictory),
        ),
    );

    const userTournamentCounts = Object.entries(tournamentCounts).map(
      ([userId, tournaments]) => ({
        userId: Number(userId),
        tournamentsCount: tournaments.size,
      }),
    );

    const currentUser = session.get("startgg:userinfo");

    return {
      league,
      allRankedLeagueEvents,
      ranking,
      tournamentCounts,
      userTournamentCounts,
      numberOfRankedPodiumsByUser,
      numberOfRankedVictoriesByUser,
      currentUser: currentUser ? JSON.parse(currentUser) : null,
    } as LeagueLoaderReturnType;
  } catch (e) {
    console.log(e);
  }
}

export default function LeagueRanking({ loaderData }: Route.ComponentProps) {
  const colorScheme = useColorScheme();

  const { currentUser } = useOutletContext<LeagueLoaderReturnType>();
  const { setNavTitle } = useNavContext();

  const {
    league,
    ranking,
    userTournamentCounts,
    numberOfRankedPodiumsByUser,
    numberOfRankedVictoriesByUser,
  } = loaderData!;

  useEffect(() => {
    if (league?.name) {
      setNavTitle(`${league?.name} - Ranking Geral`);
    }
    return () => {
      setNavTitle("");
    };
  }, [league, setNavTitle]);

  if (!ranking?.length) {
    return (
      <div className="py-24 pt-32">
        <div className="p-4 pt-0">
          <h3>Ranking Vazio</h3>
          <p>Tente novamente após um torneio ser concluído</p>
        </div>
      </div>
    );
  }
  return (
    !!ranking && (
      <div className="py-24 pt-32">
        <Table
          className="hidden lg:table"
          stickyHeader
          stickyHeaderOffset={80}
          highlightOnHover
          highlightOnHoverColor={colorScheme === "dark" ? "dark" : undefined}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-center">Posição</Table.Th>
              <Table.Th>Blader</Table.Th>
              <Table.Th className="text-center">Pontuação Atual</Table.Th>
              <Table.Th className="text-center">
                Participação em Torneios
              </Table.Th>
              <Table.Th className="text-center">Pódios Ranqueados</Table.Th>
              <Table.Th className="text-center">
                Campeã(o) em Eventos Ranqueados
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ranking?.map((standing) => (
              <Table.Tr key={standing?.id}>
                <Table.Td
                  className={classNames("text-center", {
                    "flex flex-col items-center justify-center":
                      currentUser?.id === standing?.player?.user?.id,
                  })}
                >
                  #{standing?.placement}
                  {currentUser?.id === standing?.player?.user?.id && (
                    <Pill className="bg-violet-600 dark:bg-violet-300">
                      <span className="text-neutral-200">Você</span>
                    </Pill>
                  )}
                </Table.Td>
                <Table.Td className="overflow-hidden text-ellipsis w-fit max-w-full">
                  <div className="flex gap-2 items-center w-full">
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
                    <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                      {standing?.player?.prefix ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {standing?.player?.prefix} |{" "}
                        </span>
                      ) : (
                        ""
                      )}
                      <span>{standing?.player?.gamerTag}</span>
                    </p>
                  </div>
                </Table.Td>
                <Table.Td className="text-center">
                  {standing.totalPoints}
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    userTournamentCounts?.find(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.tournamentsCount
                  }
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    numberOfRankedPodiumsByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    numberOfRankedVictoriesByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Card shadow="lg" className="block lg:hidden dark:bg-neutral-700">
          {ranking?.map((standing) => (
            <Card
              my={12}
              shadow="sm"
              withBorder
              className={classNames(
                "p-2 md:p-6 dark:bg-neutral-800 dark:border-neutral-600",
                {
                  ["border-violet-600 dark:border-violet-300"]:
                    currentUser?.id === standing?.player?.user?.id,
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
                    className={classNames("leading-tight block w-full", {
                      "text-amber-500 text-xl font-bold ":
                        standing?.placement === 1,
                      "text-gray-400 text-xl font-bold ":
                        standing?.placement === 2,
                      "text-amber-700 text-xl font-bold ":
                        standing?.placement === 3,
                      "text-violet-600 dark:text-violet-300 font-bold ":
                        currentUser?.id === standing?.player?.user?.id,
                      "text-neutral-400 dark:text-neutral-500 text-sm font-medium":
                        standing?.placement > 3,
                    })}
                  >
                    #{standing?.placement}
                  </span>
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
                    <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                      {standing?.player?.prefix ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {standing?.player?.prefix} |{" "}
                        </span>
                      ) : (
                        ""
                      )}
                      <span>{standing?.player?.gamerTag}</span>
                    </p>
                  </div>
                </div>
                <div className={classNames("w-full", classes.CardInfo)}>
                  <div className="leading-tight flex flex-col justify-between gap-2">
                    <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                      Pontuação
                    </label>
                    <span className="font-medium">{standing?.totalPoints}</span>
                  </div>
                  <div className="leading-tight flex flex-col justify-between gap-2">
                    <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                      Campeonatos
                    </label>
                    <span className="font-medium">
                      {
                        userTournamentCounts?.find(
                          (i) => i?.userId === standing?.player?.user?.id,
                        )?.tournamentsCount
                      }
                    </span>
                  </div>
                  <div className="leading-tight flex flex-col justify-between gap-2">
                    <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                      Pódios
                    </label>
                    <span className="font-medium">
                      {
                        numberOfRankedPodiumsByUser?.filter(
                          (i) => i?.userId === standing?.player?.user?.id,
                        )?.length
                      }
                    </span>
                  </div>
                  <div className="leading-tight flex flex-col justify-between gap-2">
                    <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                      Campeã(o)
                    </label>
                    <span className="font-medium">
                      x{" "}
                      {
                        numberOfRankedVictoriesByUser?.filter(
                          (i) => i?.userId === standing?.player?.user?.id,
                        )?.length
                      }
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </Card>
      </div>
    )
  );
}
