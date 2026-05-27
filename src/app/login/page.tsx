"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { useApp } from "@/components/providers/app-providers";
import { PasswordInput } from "@/components/ui/password-input";
import { BRAND_FULL_NAME, BRAND_TAGLINE, CAFE_HOURS } from "@/lib/brand";

const loginBg =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=85";

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin, isUser } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin) router.replace("/dashboard");
    else if (isUser) router.replace("/my-profile");
  }, [isAuthenticated, isAdmin, isUser, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const user = await login(username, password);
    setBusy(false);
    if (!user) {
      setError("Invalid email or password.");
      return;
    }
    router.push(user.role === "admin" ? "/dashboard" : "/my-profile");
  }

  return (
    <div className="g-shell g-login-shell-premium">
      <div className="g-login-visual">
        <Image src={loginBg} alt="" fill className="g-login-visual-image" sizes="50vw" priority />
        <div className="g-login-visual-overlay" />
        <div className="g-login-visual-content">
          <BrandLogo size="xl" showTagline />
          <h1 className="font-display g-login-visual-title">{BRAND_FULL_NAME}</h1>
          <p className="g-login-visual-text">{BRAND_TAGLINE}</p>
          <p className="g-login-visual-hours">{CAFE_HOURS}</p>
        </div>
      </div>

      <div className="g-login-panel">
        <div className="g-login-panel-inner">
          <Link href="/" className="g-back-link">
            ← Back to home
          </Link>

          <div className="g-login-panel-head">
            <h2 className="font-display g-login-title">Sign in</h2>
            <p className="g-muted g-login-sub">
              Players access profiles and invoices. Staff manage sessions, food, and billing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="g-login-form">
            <label>
              <span className="g-form-label">Email</span>
              <input
                className="g-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
              />
            </label>
            <label>
              <span className="g-form-label">Password</span>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error ? (
              <p className="g-login-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="g-btn-primary g-login-submit g-btn-lg" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
