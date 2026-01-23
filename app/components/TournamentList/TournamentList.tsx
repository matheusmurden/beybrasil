import { formatDate } from "date-fns";
import { TournamentStateEnum, type TournamentObj } from "~/types";
import classes from "./TournamentList.module.css";
import classNames from "classnames";
import { Avatar, Button, Card, Pill, PillGroup } from "@mantine/core";
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
      <div className="w-full">
        <h2 className="mb-2 font-semibold text-xl">{listTitle}</h2>
        <ul className="flex flex-col lg:flex-row gap-6 w-full lg:w-fit">
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
                "hover:border-(--accentColor) border-solid border-2 rounded w-full max-w-full overflow-hidden",
              )}
              key={i?.id}
            >
              {/*Tournament Status Section*/}
              <Card.Section className="pt-5 pb-0 px-3 mb-2">
                <div className="flex items-center justify-center gap-3">
                  {!!i?.images?.find((image) => image.type === "profile") && (
                    <Avatar
                      size="lg"
                      src={
                        i?.images?.find((image) => image.type === "profile")
                          ?.url
                      }
                    />
                  )}
                  <PillGroup className="flex flex-col flex-1 items-start">
                    {i?.state === TournamentStateEnum.ACTIVE && (
                      <Pill className=" text-white bg-green-500 dark:bg-green-700">
                        <p className="text-sm">Acontecendo Agora</p>
                      </Pill>
                    )}
                    {i?.state === TournamentStateEnum.COMPLETED && (
                      <Pill className=" text-white bg-green-500 dark:bg-green-700">
                        <p className="text-sm">Evento Concluído</p>
                      </Pill>
                    )}
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
                              new TZDate(
                                i?.startAt * 1000,
                                "America/Sao_Paulo",
                              ),
                              "dd 'de' MMMM",
                              {
                                locale: ptBR,
                              },
                            )
                          : formatDate(
                              new TZDate(
                                i?.startAt * 1000,
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

              {/*Tournament Title Section*/}
              <Card.Section withBorder className="p-4 pt-2">
                <p
                  className={classNames(
                    classes.EventTitle,
                    "font-medium leading-normal max-w-full overflow-hidden text-ellipsis whitespace-nowrap",
                  )}
                >
                  {i?.name}
                </p>
              </Card.Section>

              {/*Events Section*/}
              <Card.Section withBorder className="p-4">
                {i?.events?.map((event, eventIndex) => (
                  <div
                    className={classNames("leading-none", {
                      "mb-5 last:mb-0 ": eventIndex !== i?.events?.length,
                    })}
                    key={event?.id}
                  >
                    <div className="flex flex-col">
                      <Pill
                        size="xs"
                        className="block w-fit -translate-x-1 mb-0.5 dark:bg-neutral-600"
                      >
                        <span className="text-xs text-gray-500 dark:text-neutral-200">
                          {rankedEventIds?.includes(event?.id)
                            ? "Ranqueado"
                            : "Casual"}
                        </span>
                      </Pill>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {event?.name}
                      </p>
                    </div>

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

              {/*Call to Action Section*/}
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
