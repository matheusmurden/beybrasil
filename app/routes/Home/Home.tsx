import { Fragment } from "react/jsx-runtime";
import jsonData from "~/assets/data.json";
import manualContent from "~/assets/manualContent.json";
import { OrgSection } from "~/components";
import { useMemo } from "react";
import { track } from "@vercel/analytics";
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

  return (
    <Fragment>
      {filteredData.length > 0 ? (
        <div className={classNames(classes.Container, "pt-24")}>
          {filteredData?.map((row) => (
            <OrgSection
              key={`row-${row?.acronym}`}
              {...row}
              {...manualContent?.[
                row?.acronym?.toLowerCase() as keyof typeof manualContent
              ]}
            />
          ))}
        </div>
      ) : (
        <h4
          style={{ margin: "0 auto", textAlign: "center", minHeight: "50vh" }}
        >
          Nenhum resultado foi encontrado para a busca "{query}"
        </h4>
      )}
      <footer className="text-xs">
        <p>
          Website criado por{" "}
          <a
            target="_blank"
            rel="noreferer"
            href="https://instagram.com/matheusmurden"
            onClick={() => {
              track("click", {
                text: "@matheusmurden",
                location: "footer",
                href: "https://instagram.com/matheusmurden",
              });
            }}
          >
            @matheusmurden
          </a>
          .
        </p>
        <p>
          Este website não seria possível sem o apoio de{" "}
          <a
            target="_blank"
            rel="noreferer"
            href="https://instagram.com/wy.ver.n"
            onClick={() => {
              track("click", {
                text: "@wy.ver.n",
                location: "footer",
                href: "https://instagram.com/wy.ver.n",
              });
            }}
          >
            @wy.ver.n
          </a>{" "}
          ,{" "}
          <a
            target="_blank"
            rel="noreferer"
            href="https://instagram.com/imperadorbey"
            onClick={() => {
              track("click", {
                text: "@imperadorbey",
                location: "footer",
                href: "https://instagram.com/imperadorbey",
              });
            }}
          >
            @imperadorbey
          </a>{" "}
          e de todas as organizações pelo Brasil.
        </p>
      </footer>
    </Fragment>
  );
}
