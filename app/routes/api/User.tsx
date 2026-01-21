import { getSession } from "~/sessions.server";
import type { Route } from "./+types/User";
import type { User } from "~/types";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const user = session.get("startgg:userinfo");
  if (!user) {
    try {
      const response = await fetch("https://api.start.gg/gql/alpha", {
        method: "POST",
        body: JSON.stringify({
          query: `{
          currentUser {
              id
              name
              genderPronoun
              player {
                  prefix
                  gamerTag
              }
              images(type: "profile") {
                  url
                  type
              }
          }
        }`,
        }),
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = await response.json();

      const currentUser: User = userData?.data?.currentUser;

      return {
        currentUser,
      };
    } catch (e) {
      console.log(e);
    }
  } else {
    return {
      currentUser: JSON.parse(user),
    };
  }
}
