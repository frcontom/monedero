"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/metas", label: "Metas", icon: "🎯" },
  { href: "/journal", label: "Journal", icon: "📅" },
  { href: "/analitica", label: "Analítica", icon: "📊" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                active
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}