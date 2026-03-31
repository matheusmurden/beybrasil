import { getSession } from "~/sessions.server";
import type { EventObj, EventPhase, EventSet, Standing, User } from "~/types";
import type { Route } from "./+types/Event";
import { Tabs } from "@mantine/core";
import { useOutletContext } from "react-router";
import { useLocation } from "react-router";
import { sortEventEntrantsByStanding } from "~/helpers";
import { EventStandings } from "./EventStandings";
import { EventPhases } from "./EventPhases";
import { useEffect } from "react";
import { useNavContext } from "~/contexts";
import { Outlet } from "react-router";

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  try {
    const slug = `"tournament/${params?.tournamentSlug}/event/${params?.eventSlug}"`;
    const eventResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          event(slug: ${slug}) {
            id
            slug
            name
            numEntrants
            state
            startAt
            entryFee
            prizingInfo
            rulesMarkdown
          }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const phasesResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          event(slug: ${slug}) {
            phases {
              id
              name
              phaseOrder
              sets(perPage: 1, filters: { hideEmpty: true, showByes: false }) {
                pageInfo {
                  totalPages
                }
                nodes {
                  id
                  identifier
                  winnerId
                  state
                  fullRoundText
                  displayScore
                  slots {
                    id
                    entrant {
                      id
                      name
                    }
                  }
                  games {
                    id
                    entrant1Score
                    entrant2Score
                    winnerId
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

    const phasesData: {
      data: {
        event: {
          phases: EventPhase[];
        };
      };
    } = await phasesResponse.json();

    const promises = [];

    for (let i = 0; i < phasesData?.data?.event?.phases?.length; i++) {
      promises.push(
        await fetch("https://api.start.gg/gql/alpha", {
          method: "POST",
          body: JSON.stringify({
            query: `{
            event(slug: ${slug}) {
              phases(phaseId: ${phasesData?.data?.event?.phases[i]?.id}) {
                id
                name
                phaseOrder
                sets(perPage: 10, filters: { hideEmpty: true, showByes: false }) {
                  pageInfo {
                    totalPages
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
    const allPhasesData: PromiseFulfilledResult<{
      data: { event: { phases: EventPhase[] } };
    }>[] = await Promise.allSettled(promises);

    const allPhases = allPhasesData?.flatMap((i) => ({
      ...i?.value?.data?.event?.phases[0],
      sets: {
        ...i?.value?.data?.event?.phases[0]?.sets,
        nodes: [] as EventSet[],
      },
    }));

    let newPhases = [...allPhases];

    // Wait for all phases to fetch their sets
    await Promise.all(
      allPhases?.map(async (phase, phaseIndex) => {
        const promises = [];
        const totalPages = phase?.sets?.pageInfo?.totalPages ?? 1;

        // Push promises without awaiting (fetch pages in parallel)
        for (let i = 1; i <= totalPages; i++) {
          promises.push(
            fetch("https://api.start.gg/gql/alpha", {
              method: "POST",
              body: JSON.stringify({
                query: `{
              event(slug: ${slug}) {
                phases(phaseId: ${phase.id}) {
                  id
                  name
                  phaseOrder
                  sets(page: ${i}, perPage: 10, filters: { hideEmpty: true, showByes: false }) {
                    pageInfo {
                      totalPages
                    }
                    nodes {
                      id
                      identifier
                      winnerId
                      state
                      fullRoundText
                      displayScore
                      slots {
                        id
                        entrant {
                          id
                          name
                        }
                      }
                      games {
                        id
                        entrant1Score
                        entrant2Score
                        winnerId
                      }
                    }
                  }
                }
              }
            }`, // same query as before
              }),
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }).then(async (res) => await res.json()),
          );
        }

        const data = await Promise.allSettled(promises).then((res) => {
          return res.flatMap((i) =>
            i.status === "fulfilled"
              ? i?.value?.data?.event?.phases[0]?.sets?.nodes
              : "",
          );
        });

        newPhases[phaseIndex] = {
          ...newPhases[phaseIndex],
          sets: {
            ...newPhases[phaseIndex].sets,
            nodes: [...newPhases[phaseIndex].sets.nodes, ...data],
          },
        };
      }),
    );

    const entrantsResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
        event(slug: ${slug}) {
          entrants(query: { perPage: 512 }) {
            nodes {
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
                images(type: "profile") {
                  id
                  url
                  type
                }
              }
              standing {
                id
                isFinal
                placement
                totalPoints
                setRecordWithoutByes
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
          tournament {
            id
            name
          }
        }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const eventData: {
      data: {
        event: EventObj;
      };
    } = await eventResponse.json();

    const entrantsData: {
      data: {
        event: EventObj;
      };
    } = await entrantsResponse.json();

    return {
      event: {
        ...eventData?.data?.event,
        entrants: entrantsData?.data?.event?.entrants,
        tournament: entrantsData?.data?.event?.tournament,
        phases: newPhases, // ← Now contains the fetched sets
      },
    };
  } catch (e) {
    console.log(e);
  }
}

export default function Event({ loaderData }: Route.ComponentProps) {
  const { allRankedLeagueEvents, ranking, currentUser } = useOutletContext<{
    allRankedLeagueEvents: number[];
    ranking: Standing[];
    currentUser: User | null;
  }>();

  const { pathname } = useLocation();

  const { setNavTitle } = useNavContext();

  const isReportView = pathname.includes("/report");

  const event = loaderData?.event;
  const tournament = event?.tournament;

  const entrantsSortedByStanding = event?.entrants?.nodes
    ? sortEventEntrantsByStanding({ entrants: event.entrants.nodes })
    : [];

  useEffect(() => {
    if (tournament?.name) {
      setNavTitle(tournament?.name);
    }
    return () => {
      setNavTitle("");
    };
  }, [tournament?.name, setNavTitle]);

  return (
    <div className="py-24 pt-32">
      <h1>{event?.name}</h1>
      <Tabs defaultValue={"matches"} className="mt-8">
        <Tabs.List className="mb-4">
          <Tabs.Tab value="standings">
            <p>
              <strong>Resultados</strong>
            </p>
          </Tabs.Tab>
          <Tabs.Tab value="matches">
            <p>
              <strong>Partidas</strong>
            </p>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="standings">
          <EventStandings
            entrants={entrantsSortedByStanding}
            event={event}
            rankedEventIds={allRankedLeagueEvents}
            currentUser={currentUser}
            ranking={ranking}
          />
        </Tabs.Panel>
        <Tabs.Panel value="matches">
          <EventPhases event={event} isReportView={isReportView} />
        </Tabs.Panel>
      </Tabs>
      <Outlet context={{ entrantsSortedByStanding, event }} />
    </div>
  );
}
