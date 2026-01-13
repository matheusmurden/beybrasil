import {
  AppShellHeader,
  Tooltip,
  ActionIcon,
  Group,
  Burger,
} from "@mantine/core";
import { SearchInput } from "../SearchInput";
import { useLocation, useNavigate } from "react-router";
import { useNavContext } from "~/contexts";
import classNames from "classnames";

export const AppHeader = ({
  opened,
  toggle,
}: {
  opened: boolean;
  toggle: () => void;
}) => {
  const location = useLocation();
  const isIndexRoute = location.pathname === "/";
  const navigate = useNavigate();
  const { navTitle } = useNavContext();
  return (
    <AppShellHeader
      withBorder={false}
      className={classNames(
        "shadow-md flex px-4 py-2 min-h-20 justify-between items-center pl-4 md:pl-(--app-shell-navbar-width)",
        {
          "md:justify-center": !!navTitle,
        },
      )}
    >
      {!isIndexRoute && (
        <Tooltip label="Voltar">
          <ActionIcon
            variant="subtle"
            size={42}
            hiddenFrom="sm"
            onClick={() => navigate("/")}
          >
            &larr;
          </ActionIcon>
        </Tooltip>
      )}
      {!!navTitle && (
        <h1 className="text-lg md:text-2xl max-w-full overflow-hidden text-ellipsis">
          {navTitle}
        </h1>
      )}

      <Group h="100%" px="md">
        <Burger
          color="violet"
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
      </Group>
      <SearchInput />
    </AppShellHeader>
  );
};
