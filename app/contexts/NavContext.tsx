import {
  createContext,
  use,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

interface NavContextProps {
  navTitle?: string;
  setNavTitle: (val: string) => void;
}

export const NavContext = createContext<NavContextProps>({
  setNavTitle: () => null,
});

export const NavContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [navTitle, setTitle] = useState<string>();
  const setter = (val: string) => {
    setTitle(val);
  };
  return (
    <NavContext value={{ navTitle, setNavTitle: setter }}>
      {children}
    </NavContext>
  );
};

export const useNavContext = () => use(NavContext);
