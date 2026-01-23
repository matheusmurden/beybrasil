import { Outlet } from "react-router";
import type { Route } from "./+types/AuthGuardLayout";
import { commitSession, getSession } from "~/sessions.server";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("startgg:token");
  const user = session.get("startgg:userinfo");
  const path = new URL(request.url)?.pathname;
  if ((!token || !user) && path) {
    session.set("app:redirect", path);
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}

export default function Layout() {
  return <Outlet />;
}
