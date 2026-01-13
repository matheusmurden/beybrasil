import type { EventObj, TournamentObj } from "~/types";

export const isUserInTournament = ({
  userId,
  tournament,
}: {
  userId?: number;
  tournament: TournamentObj;
}) => {
  return (
    !!userId &&
    tournament?.allParticipants?.nodes?.map((i) => i?.user?.id).includes(userId)
  );
};

export const isUserInEvent = ({
  userId,
  event,
}: {
  userId?: number;
  event: EventObj;
}) => {
  const userIdsInEvent = event?.entrants?.nodes?.flatMap((node) =>
    node?.participants?.flatMap((i) => i?.user?.id),
  );
  return !!userId && userIdsInEvent?.includes(userId);
};
