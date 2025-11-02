import { Fragment } from "react/jsx-runtime";
import "./App.css";
import jsonData from "./assets/data.json";
import { OrgSection, SearchInput } from "./components";
import { useMemo, useState } from "react";

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
                <p>Estado(s): {getRowArrValues(row.states as string[])}</p>
                <p>Cidade(s): {getRowArrValues(row.cities as string[])}</p>
                {!!(row.instagram as string[])?.[1] && (
                  <p>
                    <a
                      target="_blank"
                      rel="noreferer"
                      href={(row.instagram as string[])?.[1]}
                    >
                      {(row.instagram as string[])?.[0] ?? ""}
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
          >
            @wiivern
          </a>{" "}
          ,{" "}
          <a
            target="_blank"
            rel="noreferer"
            href="https://instagram.com/imperadorbey"
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
