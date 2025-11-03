import { Fragment } from "react/jsx-runtime";
import "./App.css";
import jsonData from "./assets/data.json";
import { OrgSection, SearchInput } from "./components";
import { useMemo, useState } from "react";
import { track } from "@vercel/analytics";

const getRowArrValues = (arr: string[]) => {
  if (!arr.length) {
    return null;
  }
  return arr.map((i, index) => (
    <span key={i}>
      {i}
      {index !== arr.length - 1 && ", "}
    </span>
  ));
};

function App() {
  const [searchQuery, setSearchQuery] = useState<string>();
  const filteredData = useMemo(() => {
    return jsonData.filter((i) =>
      searchQuery
        ? JSON.stringify(i)?.toLowerCase().includes(searchQuery?.toLowerCase())
        : true,
    );
  }, [searchQuery]);

  return (
    <Fragment>
      <header style={{ textAlign: "center" }}>
        <h1 style={{ color: "rgba(var(--accentColor), 0.8)" }}>
          Organizações de Beyblade no Brasil
        </h1>
      </header>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      {filteredData.length > 0 ? (
        <main>
          {filteredData?.map((row) => (
            <OrgSection key={`row-${row?.acronym}`}>
              <div>
                <h1>{row.acronym}</h1>
                <h2>{row.name}</h2>
              </div>
              <div>
                <p>Estado(s): {getRowArrValues(row.states)}</p>
                <p>Cidade(s): {getRowArrValues(row.cities)}</p>
                {!!row.instagram?.[1] && (
                  <p>
                    <a
                      target="_blank"
                      rel="noreferer"
                      href={row.instagram?.[1]}
                      onClick={() => {
                        track("Org Instagram Click", {
                          org: row.acronym,
                          orgName: row.name,
                        });
                      }}
                    >
                      {row.instagram?.[0] ?? ""}
                    </a>
                  </p>
                )}
              </div>
            </OrgSection>
          ))}
        </main>
      ) : (
        <h4
          style={{ margin: "0 auto", textAlign: "center", minHeight: "50vh" }}
        >
          Nenhum resultado foi encontrado para a busca "{searchQuery}"
        </h4>
      )}
      <footer style={{ fontSize: 13, position: "absolute", bottom: 0 }}>
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
            href="https://instagram.com/wiivern"
            onClick={() => {
              track("click", {
                text: "@wiivern",
                location: "footer",
                href: "https://instagram.com/wiivern",
              });
            }}
          >
            @wiivern
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

export default App;
