"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-providers";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create-bill", label: "Create bill" },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();

  return (
    <div className="g-shell">
      <header className="g-header">
        <div className="g-container g-row" style={{ minHeight: 58 }}>
          <Link
            href="/dashboard"
            className="font-display"
            style={{ color: "#34d399", textDecoration: "none", fontWeight: 700 }}
          >
            GGEC
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {nav.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    borderRadius: 10,
                    padding: "0.45rem 0.75rem",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    background: active ? "#27272a" : "transparent",
                    color: active ? "#fafafa" : "#a1a1aa",
                    border: active ? "1px solid #3f3f46" : "1px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              style={{
                borderRadius: 10,
                padding: "0.45rem 0.75rem",
                border: "1px solid transparent",
                background: "transparent",
                color: "#a1a1aa",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="g-container" style={{ padding: "1rem 0 1.5rem" }}>
        {children}
      </main>
    </div>
  );
}
