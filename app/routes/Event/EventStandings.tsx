import { Avatar, Card, Pill, Table } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import classNames from "classnames";
import { RANKING_POINTS_BY_PLACEMENT } from "~/consts";
import type { Entrant, EventObj, Standing, User } from "~/types";
import classes from "./Event.module.css";

export const EventStandings = ({
  entrants,
  event,
  rankedEventIds,
  currentUser,
  ranking,
}: {
  entrants: Entrant[];
  event?: EventObj;
  rankedEventIds: number[];
  currentUser: User | null;
  ranking: Standing[];
}) => {
  const colorScheme = useColorScheme();
  return (
    <div className="flex flex-col gap-8">
      {entrants.length > 0 ? (
        <>
          <Table
            className="hidden lg:table"
            stickyHeader
            stickyHeaderOffset={80}
            highlightOnHover
            highlightOnHoverColor={colorScheme === "dark" ? "dark" : undefined}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="text-center">Posição</Table.Th>
                <Table.Th>Blader</Table.Th>
                <Table.Th className="text-center">Vitórias</Table.Th>
                <Table.Th className="text-center">Derrotas</Table.Th>
                {rankedEventIds?.includes(event!.id) && (
                  <>
                    <Table.Th className="text-center">
                      Ganhou Pontos Ranqueados
                    </Table.Th>
                    <Table.Th className="text-center">
                      Pontuação Ranqueada Atual
                    </Table.Th>
                    <Table.Th className="text-center">
                      Posicão Atual no Ranking
                    </Table.Th>
                  </>
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entrants.map((entrant) => (
                <Table.Tr
                  key={`table-row-${event?.id}-${entrant?.standing?.id}`}
                >
                  <Table.Td
                    className={classNames("text-center", {
                      "flex flex-col items-center justify-center":
                        currentUser?.id ===
                          entrant?.standing?.player?.user?.id ||
                        entrant?.team?.members?.find(
                          (member) =>
                            member?.player?.user?.id === currentUser?.id,
                        ),
                    })}
                  >
                    #{entrant?.standing?.placement}
                    {currentUser?.id === entrant?.standing?.player?.user?.id ||
                    entrant.team?.members?.find(
                      (member) => member?.player?.user?.id === currentUser?.id,
                    ) ? (
                      <Pill className="bg-violet-600 dark:bg-violet-300">
                        <span className="text-neutral-200">Você</span>
                      </Pill>
                    ) : (
                      <></>
                    )}
                  </Table.Td>
                  <Table.Td className="overflow-hidden text-ellipsis w-fit max-w-full">
                    <div className="flex gap-2 items-center w-full">
                      <Avatar
                        className="cursor-pointer"
                        name={entrant?.name}
                        src={
                          entrant?.standing?.player?.user?.images?.find(
                            (image) => image?.type === "profile",
                          )?.url ??
                          entrant?.team?.images?.find(
                            (image) => image?.type === "profile",
                          )?.url ??
                          ""
                        }
                        alt={entrant?.name ?? entrant?.team?.name}
                      />
                      <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                        <span>{entrant?.name}</span>
                      </p>
                    </div>
                  </Table.Td>
                  <Table.Td className="text-center">
                    {entrant?.standing?.setRecordWithoutByes?.wins}
                  </Table.Td>
                  <Table.Td className="text-center">
                    {entrant?.standing?.setRecordWithoutByes?.losses}
                  </Table.Td>
                  {rankedEventIds?.includes(event?.id ?? 0) &&
                    !!entrant?.standing?.placement && (
                      <>
                        <Table.Td className="text-center">
                          {RANKING_POINTS_BY_PLACEMENT?.[
                            entrant.standing.placement
                          ]
                            ? `+${
                                RANKING_POINTS_BY_PLACEMENT?.[
                                  entrant.standing.placement
                                ]
                              }`
                            : "+10"}
                        </Table.Td>
                        <Table.Td className="text-center">
                          {
                            ranking?.find(
                              (i) =>
                                i?.player?.user?.id ===
                                entrant?.standing?.player?.user?.id,
                            )?.totalPoints
                          }
                        </Table.Td>
                        <Table.Td className="text-center">
                          #
                          {
                            ranking?.find(
                              (i) =>
                                i?.player?.user?.id ===
                                entrant?.standing?.player?.user?.id,
                            )?.placement
                          }
                        </Table.Td>
                      </>
                    )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Card shadow="lg" className="block lg:hidden dark:bg-neutral-700">
            {event?.entrants?.nodes?.map((entrant) => (
              <Card
                my={12}
                shadow="sm"
                withBorder
                className={classNames(
                  "p-2 md:p-6 dark:bg-neutral-800 dark:border-neutral-600",
                  {
                    ["border-violet-600 dark:border-violet-300"]:
                      currentUser?.id === entrant?.standing?.player?.user?.id ||
                      entrant?.standing?.entrant?.team?.members?.find(
                        (member) =>
                          member?.player?.user?.id === currentUser?.id,
                      ),
                  },
                )}
                key={`${event.id}-${entrant?.standing?.id}`}
              >
                <div className="flex flex-col gap-6 items-start justify-center">
                  <div
                    className={classNames(
                      "items-center justify-start w-full",
                      classes.CardTitle,
                    )}
                  >
                    <span
                      className={classNames("leading-tight block w-full", {
                        "text-amber-500 text-xl font-bold ":
                          entrant?.standing?.placement === 1,
                        "text-gray-400 text-xl font-bold ":
                          entrant?.standing?.placement === 2,
                        "text-amber-700 text-xl font-bold ":
                          entrant?.standing?.placement === 3,
                        "text-violet-600 dark:text-violet-300 font-bold ":
                          currentUser?.id ===
                            entrant?.standing?.player?.user?.id ||
                          entrant?.standing?.entrant?.team?.members?.find(
                            (member) =>
                              member?.player?.user?.id === currentUser?.id,
                          ),
                        "text-neutral-400 dark:text-neutral-500 text-sm font-medium":
                          (entrant?.standing?.placement ?? 0) > 3,
                      })}
                    >
                      #{entrant?.standing?.placement}
                    </span>
                    <div className="flex gap-2 items-center">
                      <Avatar
                        className="cursor-pointer"
                        name={
                          entrant?.standing?.player?.gamerTag ??
                          entrant?.standing?.entrant?.team?.name
                        }
                        src={
                          entrant?.standing?.player?.user?.images?.find(
                            (image) => image?.type === "profile",
                          )?.url ??
                          entrant?.standing?.entrant?.team?.images?.find(
                            (image) => image?.type === "profile",
                          )?.url ??
                          ""
                        }
                        alt={
                          entrant?.standing?.player?.gamerTag ??
                          entrant?.standing?.entrant?.team?.name
                        }
                      />
                      <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                        {entrant?.standing?.player?.prefix ? (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            {entrant?.standing?.player?.prefix} |{" "}
                          </span>
                        ) : (
                          ""
                        )}
                        <span>
                          {entrant?.standing?.player?.gamerTag ??
                            entrant?.standing?.entrant?.team?.name}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className={classNames("w-full", classes.CardInfo)}>
                    <div className="leading-tight flex flex-col justify-between gap-2">
                      <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                        Vitórias
                      </label>
                      <span className="font-medium">
                        {entrant?.standing?.setRecordWithoutByes?.wins}
                      </span>
                    </div>
                    <div className="leading-tight flex flex-col justify-between gap-2">
                      <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                        Derrotas
                      </label>
                      <span className="font-medium">
                        {entrant?.standing?.setRecordWithoutByes?.losses}
                      </span>
                    </div>
                    {rankedEventIds?.includes(event?.id) && (
                      <>
                        <div className="leading-tight flex flex-col justify-between gap-2">
                          <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                            Ganhou Pts.
                          </label>
                          {!!entrant?.standing?.placement && (
                            <span className="font-medium">
                              {RANKING_POINTS_BY_PLACEMENT?.[
                                entrant?.standing?.placement
                              ]
                                ? `+${
                                    RANKING_POINTS_BY_PLACEMENT?.[
                                      entrant?.standing?.placement
                                    ]
                                  }`
                                : "+10"}
                            </span>
                          )}
                        </div>
                        <div className="leading-tight flex flex-col justify-between gap-2">
                          <label className="text-[9px] sm:text-xs text-neutral-500 font-mono tracking-tighter">
                            Ranking Atual
                          </label>
                          <span className="font-medium">
                            #
                            {
                              ranking?.find(
                                (i) =>
                                  i?.player?.user?.id ===
                                  entrant?.standing?.player?.user?.id,
                              )?.placement
                            }
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </Card>
        </>
      ) : (
        <p>Ainda não há resultados para este evento.</p>
      )}
    </div>
  );
};
