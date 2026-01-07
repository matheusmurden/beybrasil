import "@mantine/core/styles.css";
import "./index.css";
import { Analytics } from "@vercel/analytics/react";
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
  ApolloContextProvider,
} from "./contexts";
import {
  ActionIcon,
  AppShell,
  AppShellHeader,
  ColorSchemeScript,
  createTheme,
  MantineProvider,
  Tooltip,
} from "@mantine/core";
import type { Route } from "./+types/root";
import { destroySession, getSession } from "./sessions.server";
import { isAfter } from "date-fns";
import { LoginButton, SearchInput } from "./components";
import { useLocation } from "react-router";

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
  const token = session.get("startgg:token");
  const tokenExpiresAt = session.get("startgg:expires");
  if (!!tokenExpiresAt && isAfter(new Date(), new Date(tokenExpiresAt))) {
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
  return { token };
}

export default function Layout({ loaderData }: Route.ComponentProps) {
  const theme = createTheme({
    fontFamily: "Recursive, system-ui, Avenir, Helvetica, Arial, sans-serif",
    fontFamilyMonospace: "Monaco, Courier, monospace",
    headings: { fontFamily: "Outfit, sans-serif" },
    primaryColor: "violet",
    primaryShade: 6,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = ["/login", "/logout"].includes(location.pathname);
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
            <ApolloContextProvider token={loaderData?.token}>
              <SearchContextProvider>
                <AppShell className="w-full h-screen">
                  <AppShellHeader
                    withBorder={false}
                    className="w-full flex px-12 py-2 justify-between items-center"
                  >
                    {isLoginRoute && (
                      <Tooltip label="Voltar">
                        <ActionIcon
                          variant="subtle"
                          size={42}
                          color="dark"
                          onClick={() => navigate("/")}
                        >
                          &larr;
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {!isLoginRoute && (
                      <h1 className="text-2xl font-bold pointer-events-none">
                        BeyBrasil
                      </h1>
                    )}

                    <SearchInput />
                    {!isLoginRoute && <LoginButton />}
                  </AppShellHeader>
                  <div className="h-screen w-full">
                    <Outlet />
                  </div>
                </AppShell>
              </SearchContextProvider>
            </ApolloContextProvider>
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
