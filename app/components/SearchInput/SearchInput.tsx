import { useSearchContext } from "~/contexts";
import classes from "./SearchInput.module.css";
import { track } from "@vercel/analytics";

export const SearchInput = () => {
  const { query, setQuery, isSearchPage } = useSearchContext();
  return isSearchPage ? (
    <section className={classes.Container}>
      <input
        value={query}
        onChange={(e) => {
          setQuery?.(e.target.value);
        }}
        onBlur={
          import.meta.env.PROD
            ? () => {
                track("searched", {
                  query: query ?? "",
                });
              }
            : undefined
        }
        className={classes.Input}
        id="searchInput"
        type="search"
        placeholder="Digite para buscar..."
      />
    </section>
  ) : (
    <></>
  );
};
