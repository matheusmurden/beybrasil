import type { LeagueLoaderReturnType } from "~/types";
import { Avatar, Modal, Pill, Table } from "@mantine/core";
import { useNavigate } from "react-router";
import classes from "./LeagueRanking.module.css";
import { useColorScheme } from "@mantine/hooks";
import classNames from "classnames";
import { useOutletContext } from "react-router";

export default function LeagueRanking() {
  const navigate = useNavigate();
  const colorScheme = useColorScheme();

  const {
    ranking,
    league,
    currentUser,
    userTournamentCounts,
    numberOfRankedPodiumsByUser,
    numberOfRankedVictoriesByUser,
  } = useOutletContext<LeagueLoaderReturnType>();

  if (!ranking?.length) {
    return (
      <Modal
        className={classes.Modal}
        title={
          <h2 className="text-lg font-bold">[Ranking] - {league?.name}</h2>
        }
        opened
        onClose={() => navigate(location.pathname.split("/ranking")[0])}
      >
        <div className="p-4 pt-0">
          <h3>Ranking Vazio</h3>
          <p>Tente novamente após um torneio ser concluído</p>
        </div>
      </Modal>
    );
  }
  return (
    !!ranking && (
      <Modal
        className={classes.Modal}
        title={
          <h2 className="text-lg font-bold">[Ranking] - {league?.name}</h2>
        }
        opened
        onClose={() => navigate(location.pathname.split("/ranking")[0])}
      >
        <Table
          className="hidden lg:table"
          stickyHeader
          stickyHeaderOffset={60}
          highlightOnHover
          highlightOnHoverColor={colorScheme === "dark" ? "dark" : undefined}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="text-center">Posição</Table.Th>
              <Table.Th>Blader</Table.Th>
              <Table.Th className="text-center">Pontuação Atual</Table.Th>
              <Table.Th className="text-center">
                Participação em Torneios
              </Table.Th>
              <Table.Th className="text-center">Pódios Ranqueados</Table.Th>
              <Table.Th className="text-center">
                Campeã(o) em Eventos Ranqueados
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ranking?.map((standing) => (
              <Table.Tr key={standing?.id}>
                <Table.Td
                  className={classNames("text-center", {
                    "flex flex-col items-center justify-center":
                      currentUser?.id === standing?.player?.user?.id,
                  })}
                >
                  #{standing?.placement}
                  {currentUser?.id === standing?.player?.user?.id && (
                    <Pill className="bg-violet-600 dark:bg-violet-300">
                      <span className="text-neutral-200">Você</span>
                    </Pill>
                  )}
                </Table.Td>
                <Table.Td className="overflow-hidden text-ellipsis w-fit max-w-full">
                  <div className="flex gap-2 items-center w-full">
                    <Avatar
                      className="cursor-pointer"
                      name={standing?.player?.gamerTag}
                      src={
                        standing?.player?.user?.images?.find(
                          (image) => image?.type === "profile",
                        )?.url ?? ""
                      }
                      alt={standing?.player?.gamerTag}
                    />
                    <p className="inline-block overflow-hidden text-ellipsis whitespace-nowrap">
                      {standing?.player?.prefix ? (
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {standing?.player?.prefix} |{" "}
                        </span>
                      ) : (
                        ""
                      )}
                      <span>{standing?.player?.gamerTag}</span>
                    </p>
                  </div>
                </Table.Td>
                <Table.Td className="text-center">
                  {standing.totalPoints}
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    userTournamentCounts?.find(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.tournamentsCount
                  }
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    numberOfRankedPodiumsByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
                <Table.Td className="text-center">
                  {
                    numberOfRankedVictoriesByUser?.filter(
                      (i) => i?.userId === standing?.player?.user?.id,
                    )?.length
                  }
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Modal>
    )
  );
}
