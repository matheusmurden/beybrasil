import classes from "./SearchInput.module.css";

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
        className={classes.Input}
        id="searchInput"
        type="search"
        placeholder="Digite para buscar..."
      />
    </section>
  );
};
