import * as arctic from "arctic";
import type { Route } from "./+types/OAuth";
import { redirect } from "react-router";
import { commitSession, getSession } from "~/sessions.server";
import { TZDate } from "@date-fns/tz";
import { add } from "date-fns";

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
    throw new Response("Bad request.", {
      status: 400,
    });
  }
  try {
    const res = await fetch("https://api.start.gg/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_secret: clientSecret,
        code: code,
        scope: scopes,
        client_id: clientId,
        redirect_uri: redirectURL,
      }),
    });

    const tokenData: {
      access_token: string;
      token_type: "Bearer";
      expires_in: number;
      refresh_token: string;
    } = await res.json();

    const accessToken = tokenData?.access_token;
    const accessTokenExpiresAt = new TZDate(
      add(new Date(), {
        seconds: tokenData?.expires_in,
      }),
      "America/Sao_Paulo",
    );
    const refreshToken = tokenData?.refresh_token;

    const session = await getSession(request.headers.get("Cookie"));
    session.set("startgg:token", accessToken);
    session.set("startgg:expires", accessTokenExpiresAt.toUTCString());
    session.set("startgg:refresh", refreshToken);

    if (accessToken) {
      const response = await fetch("https://api.start.gg/gql/alpha", {
        method: "POST",
        body: JSON.stringify({
          query: `{
            currentUser {
                id
                name
                genderPronoun
                player {
                    prefix
                    gamerTag
                }
                images(type: "profile") {
                    url
                    type
                }
            }
          }`,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = await response?.json();

      const currentUser = userData?.data?.currentUser;
      session.set("startgg:userinfo", JSON.stringify(currentUser));
    }

    const redirectPath = session.get("app:redirect");

    if (redirectPath) {
      session.unset("app:redirect");
      return redirect(redirectPath, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } else {
      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  } catch {
    throw new Response("Something went wrong. Try again later.", {
      status: 400,
    });
  }
}
