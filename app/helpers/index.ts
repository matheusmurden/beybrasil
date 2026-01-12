import type { TournamentObj, User } from "~/types";

export const isUserInTournament = ({
  user,
  tournament,
}: {
  user?: User;
  tournament: TournamentObj;
}) => {
  return (
    !!user?.id &&
    tournament?.allParticipants?.nodes
      ?.map((i) => i?.user?.id)
      .includes(user?.id)
  );
};
