import { formatDate } from "date-fns";
import { TournamentStateEnum, type TournamentObj } from "~/types";
import classes from "./TournamentList.module.css";
import classNames from "classnames";
import { Button, Card, Pill, PillGroup } from "@mantine/core";
import { useNavigate } from "react-router";
import { useUserContext } from "~/contexts";
import { isUserInTournament } from "~/helpers";
import { ptBR } from "date-fns/locale";

export const TournamentList = ({
  tournaments,
  listTitle,
  rankedEventIds = [],
  isActive = false,
}: {
  tournaments?: TournamentObj[];
  listTitle: string;
  rankedEventIds?: number[];
  isActive?: boolean;
}) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
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
                  "animate-pulse": isActive,
                },
                "hover:border-(--accentColor) border-solid border-2 rounded",
              )}
              key={i?.id}
            >
              <Card.Section className="pt-5 pb-0 px-3 mb-2">
                <PillGroup className="flex flex-col flex-1 items-start">
                  {i?.state === TournamentStateEnum.CREATED &&
                    i?.isRegistrationOpen && (
                      <>
                        <Pill
                          className={classNames(" text-white", {
                            "bg-violet-500 dark:bg-violet-700":
                              !isUserInTournament({
                                user,
                                tournament: i,
                              }),
                            "bg-green-500 dark:bg-green-700":
                              isUserInTournament({
                                user,
                                tournament: i,
                              }),
                          })}
                        >
                          <p className="text-sm">
                            {isUserInTournament({ user, tournament: i })
                              ? "Inscrição Confirmada"
                              : "Inscrições Abertas"}
                          </p>
                        </Pill>
                      </>
                    )}
                  <Pill size="md">
                    <p className="font-medium text-sm text text-gray-600 dark:text-neutral-300">
                      Data:{" "}
                      {i?.state === TournamentStateEnum.COMPLETED
                        ? formatDate(
                            new Date(i?.startAt * 1000),
                            "dd 'de' MMMM",
                            {
                              locale: ptBR,
                            },
                          )
                        : formatDate(
                            new Date(i?.startAt * 1000),
                            "dd 'de' MMMM 'às' HH:mm",
                            {
                              locale: ptBR,
                            },
                          )}
                    </p>
                  </Pill>
                </PillGroup>
              </Card.Section>
              <Card.Section withBorder className="p-4 pt-2">
                <p
                  className={classNames(
                    classes.EventTitle,
                    "font-medium text-(--accentColor) leading-normal",
                  )}
                >
                  {i?.name}
                </p>
              </Card.Section>
              <Card.Section withBorder className="p-4">
                {i?.events?.map((event, eventIndex) => (
                  <div
                    className={classNames("leading-none", {
                      "mb-4 last:mb-0 ": eventIndex !== i?.events?.length,
                    })}
                    key={event?.id}
                  >
                    <p>
                      {event?.name}
                      <Pill size="xs" className="ml-1">
                        <span className="text-xs text-gray-500">
                          {rankedEventIds?.includes(event?.id)
                            ? "Ranqueado"
                            : "Casual"}
                        </span>
                      </Pill>
                    </p>
                    <span className="font-medium text-xs text text-gray-400 dark:text-neutral-300">
                      Início{" "}
                      {formatDate(
                        new Date(event?.startAt * 1000),
                        "'às' HH:mm",
                      )}
                    </span>
                  </div>
                ))}
              </Card.Section>
              {i?.state === TournamentStateEnum.CREATED &&
                i?.isRegistrationOpen &&
                !!user?.id && (
                  <Card.Section withBorder className="p-4">
                    {!isUserInTournament({ user, tournament: i }) ? (
                      <Button
                        size="lg"
                        w="100%"
                        onClick={() => navigate(`./${i?.slug}`)}
                      >
                        Fazer Inscrição
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        w="100%"
                        onClick={() => navigate(`./${i?.slug}`)}
                      >
                        Modificar Inscrição
                      </Button>
                    )}
                  </Card.Section>
                )}
            </Card>
          ))}
        </ul>
      </div>
    )
  );
};
