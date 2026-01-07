import * as arctic from "arctic";
import type { Route } from "./+types/oauth";
import { redirect } from "react-router";
import { commitSession, getSession } from "./sessions.server";

const clientId =
  typeof import.meta.env.VITE_STARTGG_CLIENT_ID === "string"
    ? import.meta.env.VITE_STARTGG_CLIENT_ID
    : "";
const clientSecret =
  typeof import.meta.env.VITE_STARTGG_CLIENT_SECRET === "string"
    ? import.meta.env.VITE_STARTGG_CLIENT_SECRET
    : "";
const redirectURL =
  typeof import.meta.env.VITE_STARTGG_REDIRECT_URL === "string"
    ? import.meta.env.VITE_STARTGG_REDIRECT_URL
    : "";

const startgg = new arctic.StartGG(clientId, clientSecret, redirectURL);

const scopes = [
  "user.identity",
  "user.email",
  "tournament.manager",
  "tournament.reporter",
];

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get("code")!;
  const state = searchParams.get("state")!;

  if (!state || !code) {
    throw new Response("Bad request. Try again.", {
      status: 400,
    });
  }
  const tokens = await startgg.validateAuthorizationCode(code, scopes);
  const accessToken = tokens.accessToken();
  const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
  const refreshToken = tokens.refreshToken();

  const session = await getSession(request.headers.get("Cookie"));
  session.set("startgg:token", accessToken);
  session.set("startgg:expires", accessTokenExpiresAt.toUTCString());
  session.set("startgg:refresh", refreshToken);

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
