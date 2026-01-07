import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroySession, getSession } from "./sessions.server";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    session.unset("startgg:token");
    session.unset("startgg:expires");
    session.unset("startgg:refresh");
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } catch (e) {
    console.log(e);
  }
}
