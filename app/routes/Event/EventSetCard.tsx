import { Card, Pill, CheckIcon, Avatar } from "@mantine/core";
import classNames from "classnames";
import { SetStateEnum, type EventObj, type EventSet } from "~/types";

const PlayerSlot = ({
  event,
  set,
  player,
}: {
  event: EventObj;
  set: EventSet;
  player: 1 | 2;
}) => {
  const playerSlot = set.slots[player - 1];
  return (
    <span
      key={`${set.id}-p${player}`}
      className="max-w-[40%] inline-flex items-center gap-2 overflow-hidden text-nowrap"
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

const PlayerScores = ({ set }: { set: EventSet }) => {
  const isDQ = set?.displayScore?.includes("DQ");
  return (
    <span className="text-neutral-500 font-medium text-sm">
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
      <p className="max-w-full inline-flex text-ellipsis items-center gap-2">
        <PlayerSlot event={event} set={set} player={1} />
        <PlayerScores set={set} />
        <PlayerSlot event={event} set={set} player={2} />
      </p>
    </Card>
  );
};
