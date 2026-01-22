import { useOutletContext } from "react-router";
import { TopRankedLeaguePlayers, TournamentList } from "~/components";
import { type LeagueLoaderReturnType } from "~/types";
import { useEffect } from "react";
import { useNavContext } from "~/contexts";
import { Outlet } from "react-router";

export default function League() {
  const {
    league,
    currentTournaments,
    upcomingTournaments,
    pastTournaments,
    allRankedLeagueEvents,
    ranking,
  } = useOutletContext<LeagueLoaderReturnType>();

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
      <div className="flex flex-col place-items-center md:place-items-start gap-y-12">
        {!!ranking && ranking?.length > 0 && (
          <TopRankedLeaguePlayers ranking={ranking} />
        )}
        <TournamentList
          listTitle="Eventos Acontecendo AGORA"
          tournaments={currentTournaments}
          rankedEventIds={allRankedLeagueEvents}
          isActive
        />
        <TournamentList
          listTitle="Próximos Eventos"
          tournaments={upcomingTournaments}
          rankedEventIds={allRankedLeagueEvents}
        />
        <TournamentList
          listTitle="Eventos Passados"
          tournaments={pastTournaments}
          rankedEventIds={allRankedLeagueEvents}
        />
      </div>
      <Outlet
        context={{
          league,
          currentTournaments,
          upcomingTournaments,
          pastTournaments,
          allRankedLeagueEvents,
          ranking,
        }}
      />
    </div>
  );
}
