import { Button, ButtonGroup, Card, Modal, Stack } from "@mantine/core";
import { useFetcher, useNavigate } from "react-router";
import { getSession } from "~/sessions.server";
import type { Entrant, EventObj, EventSet } from "~/types";
import type { Route } from "./+types/ReportSet";
import { useOutletContext } from "react-router";
import { EventSetCard } from "../Event/EventSetCard";
import { useMediaQuery } from "@mantine/hooks";
import classes from "./ReportSet.module.css";
import { useMemo, useState } from "react";
import { validateGameDataSubmit } from "~/helpers";
import groupBy from "lodash.groupby";
import { redirect } from "react-router";

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const gameData = JSON.parse(formData.get("gameData") as string) as {
    winnerId: number;
    gameNum: number;
  }[];
  const winnerId = formData.get("winnerId");
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");

  try {
    const reportSetResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `mutation reportSet($setId: ID!, $winnerId: ID!, $gameData: [BracketSetGameDataInput]) {
          reportBracketSet(
            setId: $setId,
            winnerId: $winnerId,
            gameData: $gameData
          ) {
            id
            state
          },
        },`,
        variables: JSON.stringify({
          setId: params?.setId,
          winnerId: winnerId,
          gameData: gameData,
        }),
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const reportSetData: {
      data: { reportBracketSet: { id: number; state: number }[] };
    } = await reportSetResponse.json();

    const reportSet = reportSetData?.data?.reportBracketSet;

    const redirectUrl = `/league/${params?.acronym}/tournament/${params?.tournamentSlug}/event/${params?.eventSlug}/report`;

    return reportSet?.length > 0 ? redirect(redirectUrl) : null;
  } catch (e) {
    console.log(e);
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const id = params?.setId;
  try {
    const setResponse = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: JSON.stringify({
        query: `{
        set(id: "${id}") {
          id
          identifier
          winnerId
          state
          fullRoundText
          displayScore
          games {
            id
            entrant1Score
            entrant2Score
            winnerId
          }
          slots {
            id
            entrant {
              id
              name
            }
          }
        }
        }`,
      }),
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const setData: {
      data: {
        set: EventSet;
      };
    } = await setResponse.json();

    return {
      set: { ...setData?.data?.set },
    };
  } catch (e) {
    console.log(e);
  }
}

export default function ReportSet({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const { event } = useOutletContext<{
    event: EventObj;
    entrantsSortedByStanding: Entrant[];
  }>();

  const set = loaderData?.set;
  const isMobile = useMediaQuery("(max-width: 860px)");
  const [selectedPlayer, setSelectedPlayer] = useState<number>();

  const [selectedPointType, setSelectedPointType] = useState<number>();

  const [score, setScore] = useState<{ winnerId: number; score: number }[]>([]);

  const handleSelectPlayer = (value: number) => {
    if (selectedPlayer !== value) {
      setSelectedPlayer(value);
    } else {
      setSelectedPlayer(undefined);
    }
  };

  const handleSelectedPointType = (value: number) => {
    if (selectedPointType !== value) {
      setSelectedPointType(value);
    } else {
      setSelectedPointType(undefined);
    }
  };

  const handleAddScore = ({
    winnerId,
    newScore,
  }: {
    winnerId?: number;
    newScore?: number;
  }) => {
    if (winnerId && newScore) {
      setScore((prev) => [...prev, { winnerId, score: newScore }]);
      setSelectedPlayer(undefined);
      setSelectedPointType(undefined);
    }
  };

  const fetcher = useFetcher();
  const busy = fetcher.state !== "idle";

  const handleSubmit = () => {
    const gameDataArr: { winnerId: number; gameNum: number }[] = [];
    score.forEach((i) => {
      const scoreArr = Array.from(Array(i.score));
      scoreArr.forEach(() => {
        const gameNum = gameDataArr.length + 1;
        gameDataArr.push({ winnerId: i?.winnerId, gameNum });
      });
    });

    const winnerId = Object.values(groupBy(gameDataArr, "winnerId"))?.sort(
      (a, b) => b.length - a?.length,
    )?.[0]?.[0]?.winnerId;

    fetcher.submit(
      { gameData: JSON.stringify(gameDataArr), winnerId },
      { method: "post", action: "./" },
    );
  };

  const pointTypeMap: Record<number, string> = {
    1: "Spin Finish",
    2: "Over/Burst Finish",
    3: "Xtreme Finish",
  };

  const isDisabledSubmit = useMemo(
    () => !validateGameDataSubmit({ scores: score }),
    [score],
  );

  return (
    <Modal
      opened
      onClose={() => navigate(-1)}
      title={`Tela de Juíz | Partida ${set?.identifier}`}
      size="auto"
      fullScreen={isMobile}
      className={classes.Modal}
    >
      <Modal.Body className="p-10">
        {set ? (
          <>
            <EventSetCard
              className="w-full xl:w-[40vw]"
              set={set}
              event={event}
              isReportView={false}
              scores={score}
            />
            <div className="mt-6 w-full flex flex-col items-center justify-center gap-6">
              <div className="w-full flex flex-col gap-4 lg:flex-row">
                <div className="w-full flex flex-col items-center gap-2">
                  <h2>Selecionar Jogador</h2>
                  <div className="flex gap-2">
                    <ButtonGroup>
                      <Button
                        onClick={() =>
                          handleSelectPlayer(set?.slots?.[0]?.entrant?.id)
                        }
                        variant={
                          selectedPlayer === set?.slots?.[0]?.entrant?.id
                            ? "filled"
                            : "outline"
                        }
                        disabled={busy}
                      >
                        {set?.slots?.[0]?.entrant?.name}
                      </Button>
                      <Button
                        onClick={() =>
                          handleSelectPlayer(set?.slots?.[1]?.entrant?.id)
                        }
                        variant={
                          selectedPlayer === set?.slots?.[1]?.entrant?.id
                            ? "filled"
                            : "outline"
                        }
                        disabled={busy}
                      >
                        {set?.slots?.[1]?.entrant?.name}
                      </Button>
                    </ButtonGroup>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-center gap-2">
                  <h2>Selecionar Pontuação</h2>
                  <ButtonGroup>
                    <Button
                      onClick={() => handleSelectedPointType(1)}
                      variant={selectedPointType === 1 ? "filled" : "outline"}
                      disabled={!selectedPlayer || busy}
                    >
                      Spin
                    </Button>
                    <Button
                      onClick={() => handleSelectedPointType(2)}
                      variant={selectedPointType === 2 ? "filled" : "outline"}
                      disabled={!selectedPlayer || busy}
                    >
                      Over/Burst
                    </Button>
                    <Button
                      onClick={() => handleSelectedPointType(3)}
                      variant={selectedPointType === 3 ? "filled" : "outline"}
                      disabled={!selectedPlayer || busy}
                    >
                      Xtreme
                    </Button>
                  </ButtonGroup>
                </div>
              </div>
              <div className="flex gap-2">
                {!!score.length && (
                  <Button
                    onClick={() => {
                      setScore([]);
                      setSelectedPointType(undefined);
                      setSelectedPlayer(undefined);
                    }}
                    disabled={busy}
                  >
                    Resetar
                  </Button>
                )}
                <Button
                  onClick={() =>
                    handleAddScore({
                      winnerId: selectedPlayer,
                      newScore: selectedPointType,
                    })
                  }
                  disabled={!selectedPlayer || !selectedPointType || busy}
                >
                  Add Pontuação
                </Button>
                <Button
                  onClick={() => handleSubmit()}
                  color="green"
                  variant="outline"
                  disabled={isDisabledSubmit || busy}
                >
                  {busy ? "Enviando..." : "Concluir"}
                </Button>
              </div>
              <Stack className="mt-6">
                {score.toReversed().map((i, index) => (
                  <Card
                    className="dark:bg-neutral-500 w-full "
                    // eslint-disable-next-line react-x/no-array-index-key
                    key={`${i.winnerId}-${i.score}-${index}`}
                  >
                    {
                      event.entrants?.nodes?.find(
                        (entrant) => entrant.id === i?.winnerId,
                      )?.name
                    }{" "}
                    fez um {pointTypeMap[i.score]}
                  </Card>
                ))}
              </Stack>
            </div>
          </>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
