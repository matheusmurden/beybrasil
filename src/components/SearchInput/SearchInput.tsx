import classes from "./SearchInput.module.css";
import { track } from "@vercel/analytics";

export const SearchInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (val: string) => void;
}) => {
  return (
    <section className={classes.Container}>
      <input
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        onBlur={
          import.meta.env.PROD
            ? () => {
                track("searched", {
                  query: value ?? "",
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
  );
};
