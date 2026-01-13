import { formatDate } from "date-fns";
import { TournamentStateEnum, type TournamentObj } from "~/types";
import classes from "./TournamentList.module.css";
import classNames from "classnames";
import { Button, Card, Pill, PillGroup } from "@mantine/core";
import { useNavigate } from "react-router";
import { useUserContext } from "~/contexts";
import { isUserInTournament } from "~/helpers";
import { ptBR } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";

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
                                userId: user?.id ?? 0,
                                tournament: i,
                              }),
                            "bg-green-500 dark:bg-green-700":
                              isUserInTournament({
                                userId: user?.id ?? 0,
                                tournament: i,
                              }),
                          })}
                        >
                          <p className="text-sm">
                            {isUserInTournament({
                              userId: user?.id ?? 0,
                              tournament: i,
                            })
                              ? "Inscrição Confirmada"
                              : "Inscrições Abertas"}
                          </p>
                        </Pill>
                      </>
                    )}
                  <Pill size="md" className="dark:bg-neutral-600">
                    <p className="font-medium text-sm text text-gray-600 dark:text-neutral-200">
                      Data:{" "}
                      {i?.state === TournamentStateEnum.COMPLETED
                        ? formatDate(
                            new TZDate(i?.startAt * 1000, "America/Sao_Paulo"),
                            "dd 'de' MMMM",
                            {
                              locale: ptBR,
                            },
                          )
                        : formatDate(
                            new TZDate(i?.startAt * 1000, "America/Sao_Paulo"),
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
                    "font-medium leading-normal",
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
                      <Pill size="xs" className="ml-1 dark:bg-neutral-600">
                        <span className="text-xs text-gray-500 dark:text-neutral-200">
                          {rankedEventIds?.includes(event?.id)
                            ? "Ranqueado"
                            : "Casual"}
                        </span>
                      </Pill>
                    </p>
                    {i?.state !== TournamentStateEnum.COMPLETED && (
                      <span className="font-medium text-xs text text-gray-400 dark:text-neutral-300">
                        Início{" "}
                        {formatDate(
                          new TZDate(
                            event?.startAt * 1000,
                            "America/Sao_Paulo",
                          ),
                          "'às' HH:mm",
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </Card.Section>
              {i?.state === TournamentStateEnum.CREATED &&
                i?.isRegistrationOpen &&
                !!user?.id && (
                  <Card.Section withBorder className="p-4">
                    {!isUserInTournament({
                      userId: user?.id ?? 0,
                      tournament: i,
                    }) ? (
                      <Button
                        component="a"
                        target="_blank"
                        rel="no-referrer"
                        href={`https://www.start.gg/${i?.slug}/register`}
                        size="lg"
                        w="100%"
                      >
                        Fazer Inscrição
                      </Button>
                    ) : (
                      <Button
                        component="a"
                        target="_blank"
                        rel="no-referrer"
                        href={`https://www.start.gg/${i?.slug}/dashboard`}
                        variant="outline"
                        size="lg"
                        w="100%"
                      >
                        Modificar Inscrição
                      </Button>
                    )}
                  </Card.Section>
                )}

              {[
                TournamentStateEnum.COMPLETED,
                TournamentStateEnum.ACTIVE,
              ].includes(i?.state) && (
                <Card.Section withBorder className="p-4">
                  <Button
                    onClick={() => navigate(`./${i?.slug}`)}
                    color="green"
                    variant="outline"
                    size="lg"
                    w="100%"
                  >
                    {i?.state === TournamentStateEnum.COMPLETED
                      ? "Ver Resultados"
                      : "Acompanhar Ao Vivo"}
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
