import { Card, Pill, CheckIcon, Avatar, Button } from "@mantine/core";
import classNames from "classnames";
import { useNavigate } from "react-router";
import { SetStateEnum, type EventObj, type EventSet } from "~/types";

const PlayerSlot = ({
  event,
  set,
  player,
  className,
  scores,
}: {
  event: EventObj;
  set: EventSet;
  player: 1 | 2;
  className?: string;
  scores?: { winnerId: number; score: number }[];
}) => {
  const playerSlot = set.slots[player - 1];

  const isPlayer1 = player === 1;

  const player1Score = scores?.length
    ? scores
        ?.filter((i) => i?.winnerId === set.slots[0].entrant.id)
        ?.reduce((acc, item) => item.score + acc, 0)
    : 0;
  const player2Score = scores
    ? scores
        ?.filter((i) => i?.winnerId === set.slots[1].entrant.id)
        ?.reduce((acc, item) => item.score + acc, 0)
    : 0;

  const isWinning =
    scores?.length && isPlayer1
      ? player1Score > player2Score
      : scores?.length && !isPlayer1
        ? player2Score > player1Score
        : false;

  return (
    <span
      key={`${set.id}-p${player}`}
      className={classNames(
        "max-w-full inline-flex items-center justify-center overflow-hidden text-nowrap",
        className,
      )}
    >
      <span
        className={classNames(
          "font-medium inline-flex items-center gap-2 max-w-full overflow-hidden",
          {
            "text-green-600 font-semibold": scores?.length
              ? isWinning
              : set?.state === SetStateEnum.COMPLETED &&
                set.winnerId === playerSlot?.entrant?.id,
          },
        )}
      >
        <Avatar
          className="inline"
          name={playerSlot.entrant?.name}
          src={
            event?.entrants?.nodes
              ?.find((entrant) => entrant.id === playerSlot?.entrant?.id)
              ?.standing?.player?.user?.images?.find(
                (image) => image.type === "profile",
              )?.url ??
            event?.entrants?.nodes
              ?.find((entrant) => entrant.id === playerSlot?.entrant?.id)
              ?.team?.images?.find((image) => image.type === "profile")?.url
          }
        />

        <span className="inline max-w-full overflow-hidden text-ellipsis">
          {playerSlot.entrant?.name}
          {!scores?.length &&
            set?.state === SetStateEnum.COMPLETED &&
            set.winnerId === playerSlot?.entrant?.id && (
              <CheckIcon className="lg:hidden mx-1 w-2 inline" />
            )}
        </span>
      </span>
    </span>
  );
};

const PlayerScores = ({
  set,
  className,
  scores,
}: {
  set: EventSet;
  className?: string;
  scores?: { winnerId: number; score: number }[];
}) => {
  const player1Score = scores?.length
    ? scores
        ?.filter((i) => i?.winnerId === set.slots[0].entrant.id)
        ?.reduce((acc, item) => item.score + acc, 0)
    : 0;
  const player2Score = scores?.length
    ? scores
        ?.filter((i) => i?.winnerId === set.slots[1].entrant.id)
        ?.reduce((acc, item) => item.score + acc, 0)
    : 0;

  const isDQ = set?.displayScore?.includes("DQ");
  return (
    <span
      className={classNames(
        "text-neutral-500 dark:text-neutral-400 font-semibold text-sm col",
        className,
      )}
    >
      <span
        className={classNames("font-mono", {
          "text-green-600": scores?.length
            ? player1Score > player2Score
            : set.slots[0].entrant.id === set.winnerId,
        })}
      >
        {scores && player1Score}
        {!scores && isDQ && set.slots[0].entrant.id === set.winnerId
          ? 0
          : isDQ && "DQ"}
        {!scores &&
          !isDQ &&
          set?.displayScore
            ?.split(set.slots[0].entrant.name)
            ?.join("")
            ?.split(" - ")[0]}
      </span>
      <span className="text-neutral-500 dark:text-neutral-400 font-normal text-xs">
        {" "}
        VS{" "}
      </span>

      <span
        className={classNames("font-mono", {
          "text-green-600": scores
            ? player2Score > player1Score
            : set.slots[1].entrant.id === set.winnerId,
        })}
      >
        {scores && player2Score}
        {!scores && isDQ && set.slots[1].entrant.id === set.winnerId
          ? 0
          : isDQ && "DQ"}
        {!scores &&
          !isDQ &&
          set?.displayScore
            ?.split(set.slots[1].entrant.name)
            ?.join("")
            ?.split(" - ")[1]}
      </span>
    </span>
  );
};

export const EventSetCard = ({
  set,
  event,
  isReportView = false,
  className,
  scores,
}: {
  set: EventSet;
  event: EventObj;
  isReportView?: boolean;
  className?: string;
  scores?: { winnerId: number; score: number }[];
}) => {
  const navigate = useNavigate();
  return (
    <Card
      className={classNames(" dark:bg-neutral-700", className)}
      padding={12}
      shadow="sm"
      withBorder
      key={set.id}
    >
      <Card.Section
        inheritPadding
        className="mb-4 pt-4 inline-flex justify-between"
      >
        <span>
          <Pill className="dark:bg-gray-400">{set?.fullRoundText}</Pill>
        </span>

        <span className="text-xs text-neutral-500 font-normal">
          <Pill className="dark:bg-gray-400">Partida {set.identifier}</Pill>
        </span>
      </Card.Section>
      <Card.Section
        inheritPadding
        className="pb-4 max-w-full inline-grid items-center place-content-center lg:place-content-start text-ellipsis grid-cols-12 gap-2"
      >
        <PlayerSlot
          className="col-start-1 col-end-13 lg:col-start-1 lg:col-end-6"
          event={event}
          set={set}
          player={1}
          scores={scores}
        />
        <PlayerScores
          className="col-start-1 col-end-13 lg:col-start-6 lg:col-end-8 text-center"
          set={set}
          scores={scores}
        />
        <PlayerSlot
          className="col-start-1 col-end-13 lg:col-start-8 lg:col-end-13"
          event={event}
          set={set}
          player={2}
          scores={scores}
        />
      </Card.Section>
      {isReportView && set.state !== SetStateEnum.COMPLETED && (
        <Card.Section inheritPadding className="pb-4">
          <Button
            variant="filled"
            fullWidth
            onClick={() => navigate(`./${set.id}`)}
          >
            Tela de Juíz
          </Button>
        </Card.Section>
      )}
    </Card>
  );
};
