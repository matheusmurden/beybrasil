import { formatDate } from "date-fns";
import { TournamentStateEnum, type TournamentObj } from "~/types";
import classes from "./TournamentList.module.css";
import classNames from "classnames";
import { Button, Card, Pill, PillGroup } from "@mantine/core";
import { useNavigate } from "react-router";

export const TournamentList = ({
  tournaments,
  listTitle,
  rankedEventIds = [],
  isActiveEvent = false,
}: {
  tournaments?: TournamentObj[];
  listTitle: string;
  rankedEventIds?: string[];
  isActiveEvent?: boolean;
}) => {
  const navigate = useNavigate();
  return (
    !!tournaments &&
    tournaments?.length > 0 && (
      <div>
        <h2 className="mb-2 font-semibold text-xl">{listTitle}</h2>
        <ul className="flex flex-col gap-6 w-fit">
          {tournaments?.map((i) => (
            <Card
              component="li"
              shadow="sm"
              padding="lg"
              className={classNames(
                classes.EventCard,
                {
                  "animate-pulse": isActiveEvent,
                },
                "hover:border-[var(--accentColor)] border-solid border-2 rounded",
              )}
              key={i?.id}
            >
              <Card.Section className="pt-5 pb-0 px-3 mb-2">
                <PillGroup className="flex flex-col flex-1 items-start">
                  {i?.state === TournamentStateEnum.CREATED &&
                    i?.isRegistrationOpen && (
                      <>
                        <Pill className="bg-violet-500 text-white">
                          <p className="text-sm">Inscrições Abertas!</p>
                        </Pill>
                      </>
                    )}
                  <Pill size="md">
                    <p className="font-medium text-sm text text-gray-600 dark:text-neutral-300">
                      Data:{" "}
                      {formatDate(
                        new Date(i?.startAt * 1000),
                        "dd/MM/yyyy 'às' HH:mm",
                      )}
                    </p>
                  </Pill>
                </PillGroup>
              </Card.Section>
              <Card.Section withBorder className="p-4 pt-2">
                <p
                  className={classNames(
                    classes.EventTitle,
                    "font-medium leading-normal",
                  )}
                >
                  {i?.name}
                </p>
              </Card.Section>
              <Card.Section withBorder className="p-4">
                {i?.events?.map((event, eventIndex) => (
                  <div
                    className={classNames({
                      "mb-4 last:mb-0 ": eventIndex !== i?.events?.length,
                    })}
                    key={event?.id}
                  >
                    <p>{event?.name}</p>
                    <Pill>
                      <em className="leading-none text-sm text-gray-500">
                        {rankedEventIds?.includes(event?.id)
                          ? "Ranqueado"
                          : "Casual"}
                      </em>
                    </Pill>
                    <span className="ml-1 font-medium text-sm text text-gray-400 dark:text-neutral-300">
                      Início:{" "}
                      {formatDate(
                        new Date(event?.startAt * 1000),
                        "'às' HH:mm",
                      )}
                    </span>
                  </div>
                ))}
              </Card.Section>
              {i?.state === TournamentStateEnum.CREATED &&
                i?.isRegistrationOpen && (
                  <Card.Section withBorder className="mb-1 p-4 pb-0">
                    <Button
                      size="lg"
                      w="100%"
                      onClick={() => navigate(`./${i?.slug}`)}
                    >
                      Fazer Inscrição
                    </Button>
                  </Card.Section>
                )}
            </Card>
          ))}
        </ul>
      </div>
    )
  );
};
