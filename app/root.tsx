import "./index.css";
import { Analytics } from "@vercel/analytics/react";
import type { ErrorResponse, LinksFunction } from "react-router";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="og:image" content="/meta_image.png" />
        <meta name="twitter:image" content="/meta_image.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <Layout>
      <Analytics />
      <Outlet />
    </Layout>
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
