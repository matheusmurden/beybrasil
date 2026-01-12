import manualContent from "~/assets/manualContent.json" with { type: "json" };
import type { Route } from "./+types/League";
import { redirect } from "react-router";
import { getSession } from "~/sessions.server";
import { TournamentList } from "~/components";
import {
  TournamentStateEnum,
  type EventObj,
  type LeagueObj,
  type TournamentObj,
} from "~/types";
import { useEffect } from "react";
import { useNavContext } from "~/contexts";

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
                    slug
                    name
                    numEntrants
                    state
                    startAt
                    images {
                      id
                      url
                      type
                    }
                    userEntrant {
                      standing {
                        placement
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
    const leagueData = await response.json();

    const league: LeagueObj = leagueData?.data?.league;

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

    return {
      league,
      allRankedLeagueEvents,
      upcomingTournaments,
      pastTournaments,
      currentTournaments,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function League({ loaderData }: Route.ComponentProps) {
  const league: LeagueObj | undefined = loaderData?.league;

  const { setNavTitle } = useNavContext();

  useEffect(() => {
    if (league?.name) {
      setNavTitle(league?.name);
    }
    return () => {
      setNavTitle("");
    };
  }, [league?.name, setNavTitle]);

  return (
    <div className="py-24 pt-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center md:place-items-start gap-y-12">
        <TournamentList
          listTitle="Eventos Acontecendo AGORA"
          tournaments={loaderData?.currentTournaments}
          rankedEventIds={loaderData?.allRankedLeagueEvents}
          isActiveEvent
        />
        <TournamentList
          listTitle="Próximos Eventos"
          tournaments={loaderData?.upcomingTournaments}
          rankedEventIds={loaderData?.allRankedLeagueEvents}
        />
        <TournamentList
          listTitle="Eventos Passados"
          tournaments={loaderData?.pastTournaments}
          rankedEventIds={loaderData?.allRankedLeagueEvents}
        />
      </div>
    </div>
  );
}
