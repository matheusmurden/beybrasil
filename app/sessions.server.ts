import { createCookie } from "react-router";
import { createCookieSessionStorage } from "react-router";

interface SessionData {
  "startgg:token": string;
  "startgg:expires": string;
  "startgg:refresh": string;
  "startgg:userinfo": string;
}

interface SessionFlashData {
  error: string;
}

const cookie = createCookie("__session", {
  httpOnly: true,
  domain: import.meta.env.PROD ? "beybrasil.org" : "localhost",
  secure: import.meta.env.PROD,
  maxAge: 604_800,
  secrets: ["l3t-1t-r1p"],
});

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie,
  });

export { getSession, commitSession, destroySession };
