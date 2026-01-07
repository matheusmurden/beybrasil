import { LoginButton } from "~/components";

export default function LoginRoute() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <header className="w-full mb-24">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-6 font-bold">BeyBrasil</h1>
          <h2 className="text-gray-600 max-w-[60%] text-center">
            Faça Login com seu perfil Start.gg para usar todas as
            funcionalidades da plataforma BeyBrasil!
          </h2>
        </div>
      </header>
      <main className="w-full flex items-center justify-center">
        <LoginButton size="lg" />
      </main>
    </div>
  );
}
