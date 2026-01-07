import {
  createContext,
  use,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { useLocation } from "react-router";

interface SearchContextProps {
  query?: string;
  setQuery?: (val: string) => void;
  isSearchPage: boolean;
}

export const SearchContext = createContext<SearchContextProps>({
  isSearchPage: false,
});

export const SearchContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [query, setQuery] = useState<string>();
  const location = useLocation();
  const isSearchPage = location?.pathname === "/";
  const setter = (val: string) => {
    setQuery(val);
  };
  return (
    <SearchContext value={{ query, setQuery: setter, isSearchPage }}>
      {children}
    </SearchContext>
  );
};

export const useSearchContext = () => use(SearchContext);
