import manualContent from "~/assets/manualContent.json" with { type: "json" };
import type { Route } from "./+types/League";
import { redirect } from "react-router";
import { getSession } from "~/sessions.server";
import { EventList } from "~/components";
import type { EventObj, LeagueObj, TournamentObj } from "~/types";
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
                isRegistrationOpen
                eventRegistrationClosesAt
                  events(limit: 20) {
                    id
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
    return {
      leagueData: leagueData?.data,
    };
  } catch (e) {
    console.log(e);
  }
}

export default function League({ loaderData }: Route.ComponentProps) {
  const league: LeagueObj = loaderData?.leagueData?.league;

  const { setNavTitle } = useNavContext();

  useEffect(() => {
    if (league?.name) {
      setNavTitle(league?.name);
    }
    return () => {
      setNavTitle("");
    };
  }, [league?.name, setNavTitle]);

  const allRankedLeagueEvents = league?.events?.nodes?.flatMap(
    (event) => event.id,
  );

  const allLeagueTournaments: TournamentObj[] = league?.events?.nodes?.flatMap(
    (event: EventObj) => event.tournament,
  );

  const allLeagueEvents: (EventObj &
    Pick<TournamentObj, "isRegistrationOpen" | "eventRegistrationClosesAt">)[] =
    allLeagueTournaments?.flatMap((tournament: TournamentObj) =>
      tournament.events.map((i) => ({
        ...i,
        isRegistrationOpen: tournament.isRegistrationOpen,
        eventRegistrationClosesAt: tournament.eventRegistrationClosesAt,
      })),
    );

  const upcomingEvents = allLeagueEvents?.filter((i) =>
    ["CREATED"].includes(i.state),
  );
  const pastEvents = allLeagueEvents?.filter((i) =>
    ["COMPLETED"].includes(i.state),
  );
  const currentEvents = allLeagueEvents?.filter((i) =>
    ["ACTIVE"].includes(i.state),
  );
  return (
    <div className="py-24 pt-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 place-items-center md:place-items-start gap-y-12">
        <EventList
          listTitle="Eventos Acontecendo AGORA"
          events={currentEvents}
          rankedEventIds={allRankedLeagueEvents}
          eventTitle={(event) => event?.name}
          isActiveEvent
        />
        <EventList
          listTitle="Próximos Eventos"
          events={upcomingEvents}
          rankedEventIds={allRankedLeagueEvents}
          eventTitle={(event) => `${event?.name}`}
        />
        <EventList
          listTitle="Eventos Passados"
          events={pastEvents}
          rankedEventIds={allRankedLeagueEvents}
          eventTitle={(event) => `${event?.name}`}
        />
      </div>
    </div>
  );
}
