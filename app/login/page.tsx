import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Monedero</h1>
        <p className="mt-1 text-slate-600">Inicia sesión para gestionar tus metas</p>
      </div>
      <LoginForm />
    </main>
  );
}