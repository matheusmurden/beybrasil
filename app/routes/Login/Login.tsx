import { LoginButton } from "~/components";
import { useUserContext } from "~/contexts";
import { getSession } from "~/sessions.server";
import type { Route } from "./+types/Login";
import { useEffect } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    const hasToken = !!session.get("startgg:token");
    return { hasToken };
  } catch (e) {
    console.log(e);
  }
}

export default function LoginRoute({ loaderData }: Route.ComponentProps) {
  const { user, setUser } = useUserContext();
  useEffect(() => {
    if (!loaderData?.hasToken) {
      setUser?.(undefined);
    }
  }, [loaderData?.hasToken, setUser]);
  return (
    !user?.id && (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <header className="w-full mb-24">
          <div className="flex flex-col items-center justify-center">
            <h1 className="mb-6 font-bold">BeyBrasil</h1>
            <h2 className="text-gray-600 dark:text-gray-400 max-w-[60%] text-center">
              Faça Login com seu perfil Start.gg para usar todas as
              funcionalidades da plataforma BeyBrasil!
            </h2>
          </div>
        </header>
        <main className="w-full flex items-center justify-center">
          <LoginButton size="lg" />
        </main>
      </div>
    )
  );
}
