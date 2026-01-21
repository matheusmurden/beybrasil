import {
  Avatar,
  Button,
  Combobox,
  useCombobox,
  type ButtonProps,
} from "@mantine/core";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useUserContext } from "~/contexts";
import { authUrl } from "~/startgg.client";
import type { User } from "~/types";
import { useFetcher } from "react-router";
import type { loader } from "~/routes/api/User";

export const LoginButton = ({
  size = "sm",
  toggleSidebar,
}: {
  size?: ButtonProps["size"];
  toggleSidebar?: () => void;
}) => {
  const { user, setUser } = useUserContext();

  const fetcher = useFetcher<typeof loader>();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const navigate = useNavigate();

  const options = [
    <Combobox.Option
      onClick={() => {
        toggleSidebar?.();
        navigate("/logout");
      }}
      value={"LOGOUT"}
      key={"LOGOUT"}
      className="dark:bg-neutral-800 dark:hover:bg-neutral-700"
    >
      <span className="text-red-400">Sair</span>
    </Combobox.Option>,
  ];

  const userImage = useMemo(() => {
    const img: User["images"][number]["url"] | undefined = user?.images?.find(
      (image) => image?.type === "profile",
    )?.url;
    return img;
  }, [user]);

  const getUser = useCallback(() => fetcher.load("/api/user"), [fetcher]);

  useEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetcher.data) {
      setUser?.(fetcher.data.currentUser);
    }
  }, [fetcher.data, setUser]);

  if (user?.id) {
    return (
      <Combobox
        store={combobox}
        width="max-content"
        position="top"
        withArrow
        withinPortal={false}
      >
        <Combobox.Target>
          <div
            onClick={() => combobox.toggleDropdown()}
            className="flex items-center gap-4 p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
          >
            <div className="flex flex-col items-end">
              <p className="text-md flex gap-1">
                <span className="text-">
                  {user?.player?.prefix ? `${user?.player?.prefix}` : ""}
                </span>
                <span>{user?.player?.prefix && "|"}</span>
                {user.player?.gamerTag}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.name}
              </p>
            </div>
            <Avatar
              className="cursor-pointer"
              name={user.name}
              src={userImage ?? ""}
              alt={user.name}
            />
          </div>
        </Combobox.Target>
        <Combobox.Dropdown className="dark:bg-neutral-800 dark:outline-neutral-800">
          <Combobox.Options className="dark:bg-neutral-800 dark:hover:bg-neutral-700">
            {options}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    );
  }
  return (
    <Button size={size} onClick={() => window?.location?.replace(authUrl)}>
      Login com Start.gg
    </Button>
  );
};
