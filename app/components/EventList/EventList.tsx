import { formatDate } from "date-fns";
import { ActivityState, type EventObj, type TournamentObj } from "~/types";
import classes from "./EventList.module.css";
import classNames from "classnames";
import { Card } from "@mantine/core";

export const EventList = ({
  events,
  listTitle,
  eventTitle,
  rankedEventIds = [],
  isActiveEvent = false,
}: {
  events: (EventObj &
    Pick<TournamentObj, "isRegistrationOpen" | "eventRegistrationClosesAt">)[];
  listTitle: string;
  eventTitle: (event: EventObj) => string;
  rankedEventIds?: string[];
  isActiveEvent?: boolean;
}) => {
  return (
    events?.length > 0 && (
      <div>
        <h2 className="mb-2 font-medium text-lg">{listTitle}</h2>
        <ul className="flex flex-col gap-6 w-fit">
          {events?.map((i) => (
            <Card
              component="li"
              shadow="sm"
              padding="lg"
              className={classNames(
                classes.EventCard,
                {
                  "animate-pulse": isActiveEvent,
                },
                "hover:border-[var(--accentColor)] border-solid border border-2 rounded cursor-pointer",
              )}
              key={i?.id}
            >
              <p className={classNames(classes.EventTitle, "leading-tight")}>
                {eventTitle(i)}
              </p>
              <p
                className={classNames(
                  "font-light text-sm text text-neutral-300",
                  classes.EventDate,
                )}
              >
                Data:{" "}
                {formatDate(
                  new Date(i?.startAt * 1000),
                  "dd/MM/yyyy 'às' HH:mm",
                )}
              </p>
              {i?.state === ActivityState.CREATED && i?.isRegistrationOpen && (
                <div className="mt-2">
                  <p className="text-sm">Inscrições Abertas!</p>
                  <p className="text-xs">
                    <em>
                      (Prazo para inscrição: até{" "}
                      {formatDate(
                        new Date(i?.eventRegistrationClosesAt * 1000),
                        "dd/MM/yyyy 'às' HH:mm",
                      )}
                      )
                    </em>
                  </p>
                </div>
              )}
              <em className="mt-2 text-sm text-gray-500">
                {rankedEventIds?.includes(i?.id) ? "Ranqueado" : "Casual"}
              </em>
              {/*{i?.state === ActivityState.CREATED && i?.isRegistrationOpen && (
                <Card.Section withBorder className="mb-1 p-5 pb-0">
                  <Button size="lg" w="100%">
                    Fazer Inscrição
                  </Button>
                </Card.Section>
              )}*/}
            </Card>
          ))}
        </ul>
      </div>
    )
  );
};
