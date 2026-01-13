import { List, ListItem } from "@mantine/core";
import classNames from "classnames";
import { useLocation } from "react-router";
import { Link } from "react-router";

export const LeagueNavigation = ({
  toggleSidebar,
}: {
  toggleSidebar: () => void;
}) => {
  const location = useLocation();
  const leagueAcronym = location?.pathname?.includes("/league")
    ? location?.pathname?.split("/league/")[1]?.split("/")[0]
    : "";
  return (
    leagueAcronym && (
      <List className="pl-6 md:pl-2 mb-12">
        <ListItem>
          <h2 className="text-lg font-semibold mb-2">
            Menu da Liga - {leagueAcronym?.toUpperCase()}
          </h2>
        </ListItem>
        <ListItem
          className={classNames(
            "hover:text-violet-500 dark:hover:text-violet-300 mb-1",
            {
              "text-violet-500 dark:text-violet-300 underline":
                location.pathname === `/league/${leagueAcronym}`,
            },
          )}
        >
          <Link onClick={toggleSidebar} to={`/league/${leagueAcronym}`}>
            Eventos
          </Link>
        </ListItem>
        <ListItem
          className={classNames(
            "hover:text-violet-500 dark:hover:text-violet-300 mb-1",
            {
              "text-violet-500 dark:text-violet-300 underline":
                location.pathname === `/league/${leagueAcronym}/ranking`,
            },
          )}
        >
          <Link onClick={toggleSidebar} to={`/league/${leagueAcronym}/ranking`}>
            Ranking
          </Link>
        </ListItem>
      </List>
    )
  );
};
