import { Card, Pill, CheckIcon, Avatar } from "@mantine/core";
import classNames from "classnames";
import { SetStateEnum, type EventObj, type EventSet } from "~/types";

const PlayerSlot = ({
  event,
  set,
  player,
  className,
}: {
  event: EventObj;
  set: EventSet;
  player: 1 | 2;
  className?: string;
}) => {
  const playerSlot = set.slots[player - 1];
  return (
    <span
      key={`${set.id}-p${player}`}
      className={classNames(
        "max-w-full inline-flex items-center overflow-hidden text-nowrap",
        className,
      )}
    >
      <span
        className={classNames(
          "font-medium inline-flex items-center gap-2 max-w-full overflow-hidden",
          {
            "text-green-600 font-semibold":
              set?.state === SetStateEnum.COMPLETED &&
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
          {set?.state === SetStateEnum.COMPLETED &&
            set.winnerId === playerSlot?.entrant?.id && (
              <CheckIcon className="mx-1 w-2 inline" />
            )}
        </span>
      </span>
    </span>
  );
};

const PlayerScores = ({
  set,
  className,
}: {
  set: EventSet;
  className?: string;
}) => {
  const isDQ = set?.displayScore?.includes("DQ");
  return (
    <span
      className={classNames(
        "text-neutral-500 font-medium text-sm col",
        className,
      )}
    >
      <span
        className={classNames("font-mono", {
          "text-green-600 font-semibold":
            set.slots[0].entrant.id === set.winnerId,
        })}
      >
        {isDQ && set.slots[0].entrant.id === set.winnerId ? 0 : isDQ && "DQ"}
        {!isDQ &&
          set?.displayScore
            ?.split(set.slots[0].entrant.name)
            ?.join("")
            ?.split(" - ")[0]}
      </span>
      <span className="text-neutral-500 font-normal text-xs"> VS </span>

      <span
        className={classNames("font-mono", {
          "text-green-600 font-semibold":
            set.slots[1].entrant.id === set.winnerId,
        })}
      >
        {isDQ && set.slots[1].entrant.id === set.winnerId ? 0 : isDQ && "DQ"}
        {!isDQ &&
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
}: {
  set: EventSet;
  event: EventObj;
}) => {
  return (
    <Card className="p-4" shadow="sm" withBorder key={set.id}>
      <p className="mb-4 inline-flex justify-between">
        <span>
          <Pill>{set?.fullRoundText}</Pill>
        </span>

        <span className="text-xs text-neutral-500 font-normal">
          <Pill>Partida {set.identifier}</Pill>
        </span>
      </p>
      <p className="max-w-full inline-grid text-ellipsis grid-cols-12 items-center gap-2">
        <PlayerSlot
          className="col-start-1 col-end-6"
          event={event}
          set={set}
          player={1}
        />
        <PlayerScores className="col-start-6 col-end-8" set={set} />
        <PlayerSlot
          className="col-start-8 col-end-13"
          event={event}
          set={set}
          player={2}
        />
      </p>
    </Card>
  );
};
