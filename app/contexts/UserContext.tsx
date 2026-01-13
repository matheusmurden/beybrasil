import {
  createContext,
  use,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import type { User } from "~/types";

interface UserContextProps {
  user?: User;
  setUser?: Dispatch<SetStateAction<User | undefined>>;
}

export const UserContext = createContext<UserContextProps>({});

export const UserContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User>();
  return <UserContext value={{ user, setUser }}>{children}</UserContext>;
};

export const useUserContext = () => use(UserContext);
