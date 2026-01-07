import {
  createContext,
  use,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

export interface User {
  id: number;
  name: string;
  images: {
    type: string;
    url: string;
  }[];
  player?: {
    prefix?: string;
    gamerTag: string;
  };
}

interface AuthContextProps {
  user?: User;
  setUser?: Dispatch<SetStateAction<User | undefined>>;
}

export const AuthContext = createContext<AuthContextProps>({});

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>();
  return <AuthContext value={{ user, setUser }}>{children}</AuthContext>;
};

export const useAuthContext = () => use(AuthContext);
