"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useApp } from "@/components/providers/app-providers";

export function UserShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout, authUser } = useApp();

  return (
    <div className="g-shell">
      <header className="g-header">
        <div className="g-container g-row" style={{ minHeight: 58 }}>
          <BrandLogo href="/my-profile" size="md" showTagline />
          <nav className="g-staff-nav">
            <Link href="/my-profile" className="g-staff-nav-link is-active">
              My profile
            </Link>
            {authUser?.email ? (
              <span className="g-muted" style={{ fontSize: "0.82rem", padding: "0 0.35rem" }}>
                {authUser.email}
              </span>
            ) : null}
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
