import { Fragment } from "react/jsx-runtime";
import "./App.css";
import jsonData from "./assets/data.json";
import manualContent from "./assets/manualContent.json";
import { OrgSection, SearchInput } from "./components";
import { use, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { AuthContext } from "./contexts";
import type { Route } from "./+types/App";
import { getSession } from "./sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  let result;
  if (token) {
    const response = await fetch("https://api.start.gg/gql/alpha", {
      method: "POST",
      body: `{"query": "{ currentUser {id discriminator birthday name genderPronoun email player { prefix gamerTag recentStandings(videogameId: 87913, limit: 20) { placement metadata entrant { event { name } } } } } }" }`,
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    result = await response.json();
  }
  return {
    token,
    user: result?.data ?? undefined,
  };
}

export default function App({ loaderData }: Route.ComponentProps) {
  const [searchQuery, setSearchQuery] = useState<string>();
  const filteredData = useMemo(() => {
    return jsonData.filter((i) =>
      searchQuery
        ? JSON.stringify(i)?.toLowerCase().includes(searchQuery?.toLowerCase())
        : true,
    );
  }, [searchQuery]);

  const { authUrl } = use(AuthContext);
  const { token, user } = loaderData;
  console.log({
    token,
    recentStandings: user.currentUser.player.recentStandings.map((i) => ({
      ...i.entrant.event,
      placement: i.placement,
    })),
  });
  return (
    <Fragment>
      <header className="text-center w-full my-12">
        <h1 style={{ color: "rgba(var(--accentColor), 0.8)" }}>
          Organizações de Beyblade no Brasil
        </h1>
        {!!user ? (
          <p>
            Logged in as <strong>{user.currentUser.player.gamerTag}</strong>
          </p>
        ) : (
          <a href={authUrl}>STARTGG</a>
        )}
      </header>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      {filteredData.length > 0 ? (
        <main>
          {filteredData?.map((row) => (
            <OrgSection
              key={`row-${row?.acronym}`}
              {...row}
              {...manualContent?.[
                row?.acronym?.toLowerCase() as keyof typeof manualContent
              ]}
            />
          ))}
        </main>
      ) : (
        <h4
          style={{ margin: "0 auto", textAlign: "center", minHeight: "50vh" }}
        >
          Nenhum resultado foi encontrado para a busca "{searchQuery}"
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
