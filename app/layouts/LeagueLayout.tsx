import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { redirect } from "react-router";
import { Outlet } from "react-router";
import { getSession } from "~/sessions.server";
import {
  TournamentStateEnum,
  type EventObj,
  type LeagueLoaderReturnType,
  type LeagueObj,
  type TournamentObj,
} from "~/types";
import type { Route } from "./+types/LeagueLayout";

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
            city
            endAt
            entrantCount
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

    const eventsResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
          league(slug: "${leagueSlug}") {
            name
            city
            endAt
            entrantCount
            events(query: { perPage: 20 }) {
              nodes {
                id
                tournament {
                  id
                  name
                  slug
                  startAt
                  state
                  isRegistrationOpen
                  eventRegistrationClosesAt
                  images(type: "profile") {
                    type
                    url
                  }
                  participants: participants(query: {
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
                    slug
                    name
                    state
                    startAt
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

    const standingsData = await standingsResponse.json();
    const eventsData = await eventsResponse.json();

    const leagueData = {
      data: {
        league: {
          ...standingsData?.data?.league,
          ...eventsData?.data?.league,
        },
      },
    };

    const league: LeagueObj = leagueData?.data?.league;

    const ranking = league?.standings?.nodes;

    const allRankedLeagueEvents = league?.events?.nodes?.flatMap(
      (event) => event.id,
    );

    const allLeagueTournaments: TournamentObj[] =
      league?.events?.nodes?.flatMap((event: EventObj) => event.tournament);

    const upcomingTournaments = allLeagueTournaments?.filter((i) =>
      [TournamentStateEnum?.CREATED].includes(i.state),
    );
    const pastTournaments = allLeagueTournaments?.filter((i) =>
      [TournamentStateEnum?.COMPLETED].includes(i.state),
    );
    const currentTournaments = allLeagueTournaments?.filter((i) =>
      [TournamentStateEnum?.ACTIVE].includes(i.state),
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
      upcomingTournaments,
      pastTournaments,
      currentTournaments,
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

export default function Layout({ loaderData }: Route.ComponentProps) {
  return <Outlet context={{ ...loaderData }} />;
}
