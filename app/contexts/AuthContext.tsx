import {
  createContext,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import * as arctic from "arctic";

// STARTGG
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

const state = arctic.generateState();
const scopes = [
  "user.identity",
  "user.email",
  "tournament.manager",
  "tournament.reporter",
];
const authorizationURL = startgg.createAuthorizationURL(state, scopes);
// ENDGG

interface User {
  accessToken?: string;
  accessTokenExpiresAt?: Date;
  refreshToken?: string;
}

interface AuthContextProps {
  authUrl: string;
  user?: User;
  setUser: Dispatch<SetStateAction<User>>;
}

const initialValue = {
  authUrl: authorizationURL.href,
  user: {},
  setUser: () => null,
};

export const AuthContext = createContext<AuthContextProps>(initialValue);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>({});
  return (
    <AuthContext
      value={{
        authUrl: initialValue.authUrl,
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext>
  );
};
