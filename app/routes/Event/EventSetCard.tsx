import { Card, Pill, CheckIcon, Avatar } from "@mantine/core";
import classNames from "classnames";
import { SetStateEnum, type EventObj, type EventSet } from "~/types";

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
      <div>
        <p className="max-w-full inline-flex text-ellipsis items-center gap-2">
          {set.slots.map((playerSlot, index) => (
            <span
              key={playerSlot.id}
              className="inline-flex items-center gap-2 overflow-hidden text-nowrap"
            >
              <span className="text-neutral-500 font-normal text-xs">
                {index !== 0 ? " VS " : ""}
              </span>
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
                      ?.find(
                        (entrant) => entrant.id === playerSlot?.entrant?.id,
                      )
                      ?.standing?.player?.user?.images?.find(
                        (image) => image.type === "profile",
                      )?.url ??
                    event?.entrants?.nodes
                      ?.find(
                        (entrant) => entrant.id === playerSlot?.entrant?.id,
                      )
                      ?.team?.images?.find((image) => image.type === "profile")
                      ?.url
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
          ))}
        </p>
      </div>
    </Card>
  );
};
