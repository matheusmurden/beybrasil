import * as arctic from "arctic";

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

const state = arctic.generateState();

const scopes = [
  "user.identity",
  "user.email",
  "tournament.manager",
  "tournament.reporter",
];

export const startgg = new arctic.StartGG(clientId, clientSecret, redirectURL);
export const authUrl = startgg.createAuthorizationURL(state, scopes);
export default startgg;
