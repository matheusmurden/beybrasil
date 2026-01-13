import { getSession } from "~/sessions.server";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect } from "react-router";
import type { LeagueObj, Standing } from "~/types";
import type { Route } from "./+types/LeagueRanking";
import { Avatar, Modal, Table } from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./LeagueRanking.module.css";
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

  const leagueSlug = allValidLeagueSlugs
    ?.filter(
      ([key, val]) =>
        key === params.acronym.toLowerCase() && Object.hasOwn(val, "league"),
    )
    ?.flatMap((i) => i[1] as { league: string })[0]?.league;

  try {
    const response = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          league(slug: "${leagueSlug}") {
            name
            city
            endAt
            entrantCount
            events {
              nodes {
                id
                tournament {
                  id
                  participants(query: { perPage: 100 }) {
                    nodes {
                      id
                      gamerTag
                      user {
                        id
                      }
                      entrants {
                        id
                        standing {
                          id
                          placement
                          isFinal
                        }
                      }
                    }
                  }
                  events(limit: 20) {
                    id
                    entrants {
                      nodes {
                        id
                        standing {
                          placement
                        }
                        participants {
                          id
                          user {
                            id
                          }
                          entrants {
                            standing {
                              placement
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            standings(query: { perPage: 100 }) {
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
    const rankingData = await response.json();

    const league: LeagueObj = rankingData?.data?.league;

    const ranking: Standing[] = league?.standings?.nodes;

    const allRankedLeagueEvents = league?.events?.nodes?.flatMap(
      (event) => event.id,
    );

    const tournamentsParticipants = league?.events?.nodes?.flatMap(
      (tournamentNode) =>
        tournamentNode?.tournament?.participants?.nodes
          ?.flatMap((i) => ({
            tournamentId: tournamentNode?.tournament?.id,
            userId: i?.user?.id,
          }))
          ?.filter((i) => !!i?.userId),
    );

    const tournamentCounts = tournamentsParticipants.reduce(
      (acc: Record<number, Set<number>>, { userId, tournamentId }) => {
        acc[userId] ??= new Set<number>();
        acc[userId].add(tournamentId);
        return acc;
      },
      {},
    );

    const numberOfRankedPodiumsByUser = league?.events?.nodes?.flatMap(
      (rankedEventNode) =>
        rankedEventNode?.tournament?.events?.flatMap((eventNode) =>
          eventNode?.entrants?.nodes
            ?.flatMap((entrantNode) =>
              entrantNode?.participants?.flatMap((participantNode) => ({
                rankedEventId: rankedEventNode.id,
                eventId: eventNode?.id,
                isPodium: Boolean((entrantNode?.standing?.placement ?? 4) < 4),
                userId: participantNode?.user?.id,
              })),
            )
            ?.filter((i) => allRankedLeagueEvents?.includes(i?.eventId))
            ?.filter((i) => i?.isPodium),
        ),
    );

    const numberOfRankedVictoriesByUser = league?.events?.nodes?.flatMap(
      (rankedEventNode) =>
        rankedEventNode?.tournament?.events?.flatMap((eventNode) =>
          eventNode?.entrants?.nodes
            ?.flatMap((entrantNode) =>
              entrantNode?.participants?.flatMap((participantNode) => ({
                rankedEventId: rankedEventNode.id,
                eventId: eventNode?.id,
                isVictory: Boolean(
                  (entrantNode?.standing?.placement ?? 0) === 1,
                ),
                userId: participantNode?.user?.id,
              })),
            )
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

    return {
      ranking,
      league,
      userTournamentCounts,
      numberOfRankedPodiumsByUser,
      numberOfRankedVictoriesByUser,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function LeagueRanking({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const colorScheme = useColorScheme();

  if (!loaderData?.ranking?.length) {
    return (
      <Modal
        className={classes.Modal}
        title={
          <h2 className="text-lg font-bold">
            [Ranking] - {loaderData?.league?.name}
          </h2>
        }
        opened
        onClose={() => navigate(location.pathname.split("/ranking")[0])}
      >
        <div className="p-4 pt-0">
          <h3>Ranking Vazio</h3>
          <p>Tente novamente após um torneio ser concluído</p>
        </div>
      </Modal>
    );
  }
  return (
    !!loaderData?.ranking && (
      <Modal
        className={classes.Modal}
        title={
          <h2 className="text-lg font-bold">
            [Ranking] - {loaderData?.league?.name}
          </h2>
        }
        opened
        onClose={() => navigate(location.pathname.split("/ranking")[0])}
      >
        <Table
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
            {loaderData?.ranking?.map((standing) => (
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
                  {standing.totalPoints}
                </Table.Td>
                <Table.Td className="text-center">
                  {loaderData?.userTournamentCounts?.find(
                    (i) => i?.userId === standing?.player?.user?.id,
                  )?.tournamentsCount ?? 0}
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    loaderData?.numberOfRankedPodiumsByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    loaderData?.numberOfRankedVictoriesByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>
    )
  );
}
