import * as arctic from "arctic";

export const clientId: string = import.meta.env.VITE_STARTGG_CLIENT_ID;
export const clientSecret: string = import.meta.env.VITE_STARTGG_CLIENT_SECRET;
export const redirectURL: string = import.meta.env.VITE_STARTGG_REDIRECT_URL;

const state = arctic.generateState();

export const scopes = [
  "user.identity",
  "user.tournamentRegistration",
  "user.email",
  "tournament.manager",
  "tournament.reporter",
];

export const startgg = new arctic.StartGG(clientId, clientSecret, redirectURL);
export const authUrl = startgg.createAuthorizationURL(state, scopes);
export default startgg;
