import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monedero",
  description: "Gestiona tus metas financieras, registra movimientos y mantén tu disciplina de ahorro.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Monedero",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}