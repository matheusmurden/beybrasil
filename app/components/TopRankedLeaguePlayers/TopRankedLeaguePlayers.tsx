import { Avatar, Button } from "@mantine/core";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import type { Standing } from "~/types";

export const TopRankedLeaguePlayers = ({
  ranking,
}: {
  ranking: Standing[];
}) => {
  const [top1, top2, top3] = ranking.slice(0, 3);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <section className="w-full text-center flex flex-col gap-12">
      <h2 className="font-bold text-3xl">🏆 Top 3 Bladers da Liga</h2>
      <div className="h-65 md:h-90 w-full flex items-center justify-center">
        <div className="flex gap-6 h-full items-end justify-center w-full">
          <div className="pt-15 w-[25%] h-[65%] bg-linear-to-b from-gray-500 via-gray-400 to-gray-300 relative rounded-t-lg">
            <Avatar
              name={top2?.player?.gamerTag}
              src={
                top2?.player?.user?.images?.find((i) => i?.type === "profile")
                  ?.url
              }
              variant="filled"
              className="absolute top-0 left-[50%] w-25 h-25 -translate-y-12 -translate-x-[50%]"
            />
            <h2 className="text-white font-medium text-xs md:text-md italic mb-2">
              2º Lugar
            </h2>
            <h3 className="text-white font-bold text-xs md:text-xl">
              {top2?.player?.prefix ? `${top2?.player?.prefix} | ` : ""}
              {top2?.player?.gamerTag}
            </h3>
            <p className="mt-6 text-white font-bold text-xs md:text-2xl">
              {top2?.totalPoints} Pontos
            </p>
          </div>
          <div className="pt-15 w-[25%] h-[80%] bg-linear-to-b from-amber-500 via-amber-400 to-amber-300 relative rounded-t-lg">
            <Avatar
              name={top1?.player?.gamerTag}
              src={
                top1?.player?.user?.images?.find((i) => i?.type === "profile")
                  ?.url
              }
              variant="filled"
              className="absolute top-0 left-[50%] w-25 h-25 -translate-y-12 -translate-x-[50%]"
            />
            <h2 className="text-white font-medium text-xs md:text-md italic mb-2">
              1º Lugar
            </h2>
            <h3 className="text-white font-bold text-xs md:text-xl">
              {top1?.player?.prefix ? `${top1?.player?.prefix} | ` : ""}
              {top1?.player?.gamerTag}
            </h3>
            <p className="mt-8 text-white font-bold text-xs md:text-2xl">
              {top1?.totalPoints} Pontos
            </p>
          </div>
          <div className="pt-15 w-[25%] h-[55%] bg-linear-to-b from-amber-800 via-amber-700 to-amber-600 relative rounded-t-lg">
            <Avatar
              name={top3?.player?.gamerTag}
              src={
                top3?.player?.user?.images?.find((i) => i?.type === "profile")
                  ?.url
              }
              variant="filled"
              className="absolute top-0 left-[50%] w-25 h-25 -translate-y-12 -translate-x-[50%]"
            />
            <h2 className="text-white font-medium text-xs md:text-md italic mb-2">
              3º Lugar
            </h2>
            <h3 className="text-white font-bold text-xs md:text-xl">
              {top3?.player?.prefix ? `${top3?.player?.prefix} | ` : ""}
              {top3?.player?.gamerTag}
            </h3>
            <p className="mt-4 text-white font-bold text-xs md:text-2xl">
              {top3?.totalPoints} Pontos
            </p>
          </div>
        </div>
      </div>
      <Button
        component="a"
        href={`${location?.pathname}/ranking`}
        onClick={(e) => {
          e.preventDefault();
          navigate("./ranking");
        }}
        className="w-fit self-center"
      >
        Ver Ranking Completo
      </Button>
    </section>
  );
};
