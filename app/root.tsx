import "@mantine/core/styles.css";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics";
import type { ErrorResponse, LinksFunction } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useNavigate,
} from "react-router";
import {
  UserContextProvider,
  SearchContextProvider,
  NavContextProvider,
} from "./contexts";
import {
  ActionIcon,
  AppShell,
  AppShellFooter,
  AppShellMain,
  AppShellNavbar,
  CloseButton,
  ColorSchemeScript,
  createTheme,
  Group,
  MantineProvider,
  Tooltip,
} from "@mantine/core";
import type { Route } from "./+types/root";
import { commitSession, destroySession, getSession } from "./sessions.server";
import { add, differenceInDays, isAfter, isBefore } from "date-fns";
import {
  AppHeader,
  LeagueNavigation,
  LoadingSpinner,
  LoginButton,
} from "./components";
import { useLocation } from "react-router";
import { useDisclosure } from "@mantine/hooks";
import { useNavigation } from "react-router";
import { Link } from "react-router";
import { TZDate } from "@date-fns/tz";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Recursive:slnt,wght,CRSV,MONO@-15..0,300..800,0,0..1&display=swap",
  },
  { rel: "shortcut icon", href: "/vite.svg", type: "image/svg" },
  { rel: "icon", href: "/vite.svg", type: "image/svg" },
  { rel: "manifest", href: "/manifest.json" },
];

export function meta() {
  return [
    { title: "BeyBrasil - Comunidade de BeyBlade no Brasil" },
    {
      name: "description",
      content:
        "Sua plataforma definitiva para o universo Beyblade no Brasil! Encontre organizações, bladers e fique por dentro dos torneios. A comunidade começa aqui!",
    },
    {
      name: "og:type",
      content: "website",
    },
    {
      name: "og:site_name",
      content: "BeyBrasil",
    },
    {
      name: "og:url",
      content: "https://www.beybrasil.org/",
    },
    { name: "og:image", content: "/meta_image.png" },
    {
      name: "og:title",
      content: "BeyBrasil - Comunidade de BeyBlade no Brasil",
    },
    {
      name: "og:description",
      content:
        "Sua plataforma definitiva para o universo Beyblade no Brasil! Encontre organizações, bladers e fique por dentro dos torneios. A comunidade começa aqui!",
    },
    {
      name: "twitter:card",
      content: "summary_large_image",
    },
    {
      name: "twitter:url",
      content: "https://www.beybrasil.org/",
    },
    { name: "twitter:image", content: "/meta_image.png" },
    {
      name: "twitter:title",
      content: "BeyBrasil - Comunidade de BeyBlade no Brasil",
    },
    {
      name: "twitter:description",
      content:
        "Sua plataforma definitiva para o universo Beyblade no Brasil! Encontre organizações, bladers e fique por dentro dos torneios. A comunidade começa aqui!",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const refreshToken = session.get("startgg:refresh");
  const tokenExpiresAt = session.get("startgg:expires");

  let isTokenExpiringSoon = false;

  // Check if auth token is expiring "soon" (24h after the token has been originally emitted)
  if (
    !!tokenExpiresAt &&
    isBefore(
      new TZDate(new Date(), "America/Sao_Paulo"),
      new TZDate(tokenExpiresAt, "America/Sao_Paulo"),
    )
  ) {
    const daysUntilExpiration = differenceInDays(
      new TZDate(tokenExpiresAt, "America/Sao_Paulo"),
      new TZDate(new Date(), "America/Sao_Paulo"),
    );
    isTokenExpiringSoon = daysUntilExpiration <= 5 && daysUntilExpiration >= 0;
  }
  // Clean Auth Session Cookies if token is expired
  else if (
    !!tokenExpiresAt &&
    isAfter(
      new TZDate(new Date(), "America/Sao_Paulo"),
      new TZDate(tokenExpiresAt, "America/Sao_Paulo"),
    )
  ) {
    try {
      session.unset("startgg:token");
      session.unset("startgg:expires");
      session.unset("startgg:refresh");
      return redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  // Refresh Auth Token if token is not expired but is expiring "soon"
  if (tokenExpiresAt && isTokenExpiringSoon && refreshToken) {
    const res = await fetch("https://api.start.gg/oauth/refresh", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        client_secret: import.meta.env.VITE_STARTGG_CLIENT_SECRET,
        refresh_token: refreshToken,
        scope: [
          "user.identity",
          "user.email",
          "tournament.manager",
          "tournament.reporter",
        ],
        client_id: import.meta.env.VITE_STARTGG_CLIENT_ID,
        redirect_uri: import.meta.env.VITE_STARTGG_REDIRECT_URL,
      }),
    });

    const tokenData: {
      access_token: string;
      token_type: "Bearer";
      expires_in: number;
      refresh_token: string;
    } = await res?.json();

    const accessToken = tokenData?.access_token;
    const accessTokenExpiresAt = new TZDate(
      add(new Date(), {
        seconds: tokenData?.expires_in,
      }),
      "America/Sao_Paulo",
    );
    const newRefreshToken = tokenData?.refresh_token;

    const session = await getSession(request.headers.get("Cookie"));
    session.set("startgg:token", accessToken);
    session.set("startgg:expires", accessTokenExpiresAt.toUTCString());
    session.set("startgg:refresh", newRefreshToken);

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function Layout() {
  const theme = createTheme({
    fontFamily: "Recursive, system-ui, Avenir, Helvetica, Arial, sans-serif",
    fontFamilyMonospace: "Monaco, Courier, monospace",
    headings: { fontFamily: "Outfit, sans-serif" },
    primaryColor: "violet",
    primaryShade: 6,
  });
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  const location = useLocation();
  const isLoginRoute = ["/login", "/logout"].includes(location.pathname);
  const isIndexRoute = location.pathname === "/";
  const [opened, { toggle }] = useDisclosure();
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <ColorSchemeScript />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Analytics />
          <UserContextProvider>
            <NavContextProvider>
              <SearchContextProvider>
                <AppShell
                  className="w-full h-screen"
                  navbar={{
                    width: 300,
                    breakpoint: "sm",
                    collapsed: { mobile: !opened },
                  }}
                >
                  <AppHeader opened={opened} toggle={toggle} />

                  <AppShellNavbar>
                    <aside className="w-full h-full flex flex-col px-4 py-6 justify-between">
                      <div className="flex min-h-12 w-full justify-between items-center">
                        {!isIndexRoute && (
                          <Tooltip label="Voltar">
                            <ActionIcon
                              variant="subtle"
                              size={42}
                              visibleFrom="sm"
                              onClick={() => navigate(-1)}
                            >
                              &larr;
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Link to="/">
                          <h1 className="ml-4 md:ml-0 md:mr-4 text-2xl font-bold pointer-events-none">
                            BeyBrasil
                          </h1>
                        </Link>
                        {opened && (
                          <Group className="ml-auto" h="100%" px="md">
                            <CloseButton
                              onClick={toggle}
                              hiddenFrom="sm"
                              size="md"
                            />
                          </Group>
                        )}
                      </div>
                      <div>
                        <LeagueNavigation toggleSidebar={toggle} />
                        {!isLoginRoute && (
                          <div className="ml-4 md:ml-0">
                            <LoginButton toggleSidebar={toggle} />
                          </div>
                        )}
                      </div>
                    </aside>
                  </AppShellNavbar>
                  <AppShellMain className="h-screen w-full">
                    {isNavigating ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <Outlet />
                    )}
                    <AppShellFooter className="hidden md:block text-xs text-neutral-400 dark:text-neutral-500 pl-4 md:pl-(--app-shell-navbar-width) md:ml-4 py-2">
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
                    </AppShellFooter>
                  </AppShellMain>
                </AppShell>
              </SearchContextProvider>
            </NavContextProvider>
          </UserContextProvider>
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary(error: ErrorResponse | Error) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
