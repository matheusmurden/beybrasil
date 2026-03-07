import type { Entrant, EventObj, EventSet, TournamentObj } from "~/types";

export const isUserInTournament = ({
  userId,
  tournament,
}: {
  userId?: number;
  tournament: TournamentObj;
}) => {
  return (
    !!userId &&
    tournament?.participants?.nodes?.map((i) => i?.user?.id).includes(userId)
  );
};

export const isUserInEvent = ({
  userId,
  event,
}: {
  userId?: number;
  event: EventObj;
}) => {
  const result =
    event?.entrants?.nodes
      ?.flatMap((node) => node?.participants?.flatMap((i) => i?.user?.id))
      ?.some((i) => i === userId) ?? [];
  return result;
};

export const sortEventEntrantsByStanding = ({
  entrants,
}: {
  entrants: Entrant[];
}) => {
  return entrants?.sort(
    (a, b) => (a?.standing?.placement ?? 0) - (b?.standing?.placement ?? 0),
  );
};

export const sortEventSetsByIdentifier = ({ sets }: { sets: EventSet[] }) => {
  return sets.toSorted((a, b) => {
    const idA = a.identifier;
    const idB = b.identifier;

    if (idA.length === idB.length) {
      return idA.localeCompare(idB);
    } else if (idA.length > 1 && idB.length === 1) {
      return 1;
    } else if (idB.length > 1 && idA.length === 1) {
      return -1;
    }

    return 0;
  });
};
