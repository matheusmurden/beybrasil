import { Avatar, Button, type ButtonProps } from "@mantine/core";
import { useMemo } from "react";
import { useAuthContext, type User } from "~/contexts";
import { authUrl } from "~/startgg.client";

export const LoginButton = ({
  size = "sm",
}: {
  size?: ButtonProps["size"];
}) => {
  const { user } = useAuthContext();
  const userImage = useMemo(() => {
    const img: User["images"][number]["url"] | undefined = user?.images?.find(
      (image) => image?.type === "profile",
    )?.url;
    return img;
  }, [user]);
  if (user?.id) {
    return (
      <div className="flex items-center gap-4 pointer-events-none">
        <div className="flex flex-col items-end">
          <p className="text-md flex gap-1">
            <span className="text-">
              {user?.player?.prefix ? `${user?.player?.prefix}` : ""}
            </span>
            <span>{user?.player?.prefix && "|"}</span>
            {user.player?.gamerTag}
          </p>
          <p className="text-xs text-gray-500">{user.name}</p>
        </div>
        {!!userImage && (
          <Avatar name={user.name} src={userImage} alt={user.name} />
        )}
      </div>
    );
  }
  return (
    <Button size={size} onClick={() => window?.location?.replace(authUrl)}>
      Login com Start.gg
    </Button>
  );
};
