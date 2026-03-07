import { TZDate } from "@date-fns/tz";
import { Card, PillGroup, Pill, Button } from "@mantine/core";
import classNames from "classnames";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActivityStateEnum } from "~/types";
import type { TournamentObj } from "~/types";
import classes from "./EventList.module.css";
import { useNavigate } from "react-router";

export const EventList = ({
  tournament,
  rankedEvents,
}: {
  tournament: TournamentObj;
  rankedEvents: number[];
}) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {tournament?.events?.map((event) => (
        <Card
          className={classNames(
            classes.EventCard,
            "border-solid border-2 rounded w-full max-w-full overflow-hidden",
          )}
          shadow="sm"
          key={`event-card-${event.id}`}
        >
          {/*Event Status Section*/}
          <Card.Section className="pt-5 pb-0 px-3 mb-2">
            <div className="flex items-center justify-center gap-3">
              <PillGroup className="flex flex-col flex-1 items-start">
                {event?.state === ActivityStateEnum.ACTIVE && (
                  <Pill className=" text-white bg-green-500 dark:bg-green-700">
                    <p className="text-sm">Acontecendo Agora</p>
                  </Pill>
                )}
                {event?.state === ActivityStateEnum.COMPLETED && (
                  <Pill className=" bg-none dark:bg-neutral-700 text-green-500 border border-green-500 dark:border-green-700">
                    <p className="text-sm">Evento Concluído</p>
                  </Pill>
                )}
                <Pill size="md" className="dark:bg-neutral-600">
                  <p className="font-medium text-sm text text-gray-600 dark:text-neutral-200">
                    Data:{" "}
                    {event?.state === ActivityStateEnum.COMPLETED
                      ? formatDate(
                          new TZDate(
                            event?.startAt * 1000,
                            "America/Sao_Paulo",
                          ),
                          "dd 'de' MMMM 'às' HH:mm",
                          {
                            locale: ptBR,
                          },
                        )
                      : formatDate(
                          new TZDate(
                            event?.startAt * 1000,
                            "America/Sao_Paulo",
                          ),
                          "dd 'de' MMMM 'às' HH:mm",
                          {
                            locale: ptBR,
                          },
                        )}
                  </p>
                </Pill>
              </PillGroup>
            </div>
          </Card.Section>
          <Card.Section withBorder className="p-4 pt-2">
            <div className="flex flex-row gap-4 items-center">
              <h2
                className={classNames(
                  classes.EventTitle,
                  "font-medium leading-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                )}
              >
                {event.name}
              </h2>
              <Pill size="xs" className="block w-fit dark:bg-neutral-600">
                <span className="text-xs text-gray-500 dark:text-neutral-200">
                  {rankedEvents?.includes(event?.id) ? "Ranqueado" : "Casual"}
                </span>
              </Pill>
            </div>
          </Card.Section>
          <Card.Section className="p-4 grid grid-cols-2 gap-2">
            <Button
              onClick={() =>
                navigate(`./event/${event?.slug?.split("/event/")[1]}`)
              }
            >
              Ver Resultados
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate(`./event/${event?.slug?.split("/event/")[1]}/matches`)
              }
            >
              Ver Partidas
            </Button>
          </Card.Section>
        </Card>
      ))}
    </div>
  );
};
