"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useApp } from "@/components/providers/app-providers";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/active-sessions", label: "Active sessions", showLiveCount: true },
  { href: "/create-bill", label: "Start session" },
  { href: "/customers", label: "Customers" },
  { href: "/food", label: "Food menu" },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, activeSessions } = useApp();
  const liveCount = activeSessions.length;

  return (
    <div className="g-shell">
      <header className="g-header">
        <div className="g-container g-row" style={{ minHeight: 58 }}>
          <BrandLogo href="/dashboard" size="md" showTagline />
          <nav className="g-staff-nav">
            {nav.map(({ href, label, showLiveCount }) => {
              const active =
                pathname === href ||
                (href === "/customers" && pathname.startsWith("/customers"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`g-staff-nav-link${active ? " is-active" : ""}`}
                >
                  {label}
                  {showLiveCount && liveCount > 0 ? (
                    <span className="g-nav-badge">{liveCount}</span>
                  ) : null}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="g-staff-nav-link g-staff-nav-signout"
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
