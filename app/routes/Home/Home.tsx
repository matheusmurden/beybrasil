import { Fragment } from "react/jsx-runtime";
import jsonData from "~/assets/data.json";
import manualContent from "~/assets/manualContent.json" with { type: "json" };
import { OrgSection } from "~/components";
import { useMemo } from "react";
import { useSearchContext } from "~/contexts";
import classNames from "classnames";
import classes from "./Home.module.css";

export default function Home() {
  const { query } = useSearchContext();

  const filteredData = useMemo(() => {
    return jsonData.filter((i) =>
      query
        ? JSON.stringify(i)?.toLowerCase().includes(query?.toLowerCase())
        : true,
    );
  }, [query]);

  const unrankedOrgs = filteredData?.filter((i) => {
    const manualData =
      manualContent?.[
        i?.acronym?.toLowerCase() as keyof typeof manualContent
      ] ?? {};
    const hasRankedLeague = Object.hasOwn(manualData, "league");
    return !hasRankedLeague;
  });

  const rankedOrgs = filteredData?.filter((i) => {
    return !unrankedOrgs
      .map((i) => i?.acronym?.toLowerCase())
      ?.includes(i?.acronym?.toLowerCase());
  });

  return (
    <Fragment>
      {rankedOrgs.length > 0 || unrankedOrgs.length > 0 ? (
        <div className="pt-24">
          {rankedOrgs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-violet-600">
                Organizações com Ranking Cadastrado
              </h3>
              <div className={classNames(classes.Container, "pt-6 pb-12")}>
                {rankedOrgs?.map((row) => (
                  <OrgSection
                    key={`row-${row?.acronym}`}
                    {...row}
                    {...manualContent?.[
                      row?.acronym?.toLowerCase() as keyof typeof manualContent
                    ]}
                  />
                ))}
              </div>
            </div>
          )}
          {unrankedOrgs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-violet-600">
                Organizações sem Ranking Cadastrado
              </h3>
              <div className={classNames(classes.Container, "pt-6")}>
                {unrankedOrgs?.map((row) => (
                  <OrgSection
                    key={`row-${row?.acronym}`}
                    {...row}
                    {...manualContent?.[
                      row?.acronym?.toLowerCase() as keyof typeof manualContent
                    ]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <h4
          style={{ margin: "0 auto", textAlign: "center", minHeight: "50vh" }}
        >
          Nenhum resultado foi encontrado para a busca "{query}"
        </h4>
      )}
    </Fragment>
  );
}
