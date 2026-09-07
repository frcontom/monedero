import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-bold">Monedero</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">Inicia sesión para gestionar tus metas</p>
      </div>
      <LoginForm />
    </main>
  );
}