import { Form, redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroySession, getSession } from "./sessions.server";
import { Button } from "@mantine/core";

export async function action({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    session.unset("startgg:token");
    session.unset("startgg:expires");
    session.unset("startgg:refresh");
    return redirect("/", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export default function LogoutPage() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <header className="w-full mb-24">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-6 font-bold text-red-400">Logout</h1>
          <h2 className="text-gray-600 dark:text-gray-400 max-w-[60%] text-center">
            Tem certeza que deseja fazer logout da plataforma BeyBrasil?
          </h2>
        </div>
      </header>
      <main className="w-full flex items-center justify-center">
        <Form method="post">
          <Button size="lg" color="red" type="submit">
            Fazer Logout
          </Button>
        </Form>
      </main>
    </div>
  );
}
