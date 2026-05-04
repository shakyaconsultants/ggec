"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/app-providers";

export default function LoginPage() {
  const { login, isAuthenticated } = useApp();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const ok = await login(username, password);
    setBusy(false);
    if (!ok) {
      setError("Invalid credentials. Use seeded login email and password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="g-shell" style={{ display: "grid", placeItems: "center", padding: "1rem" }}>
      <div
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          opacity: 0.4,
          zIndex: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgb(16 185 129 / 0.25), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgb(139 92 246 / 0.12), transparent)",
        }}
      />
      <div
        className="g-card"
        style={{
          width: "min(420px, 100%)",
          position: "relative",
          zIndex: 1,
          padding: "1.2rem",
        }}
      >
        <Link
          href="/"
          style={{ display: "inline-flex", color: "#a1a1aa", fontSize: "0.78rem", textDecoration: "none" }}
        >
          {"<-"} Back to GGEC home
        </Link>
        <div style={{ marginTop: "0.8rem" }}>
          <h1 className="font-display" style={{ margin: 0, fontSize: "1.65rem" }}>Staff sign in</h1>
          <p className="g-muted" style={{ marginTop: "0.28rem", fontSize: "0.9rem" }}>
            Use authorized center-management credentials.
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem", display: "grid", gap: "0.8rem" }}>
          <label>
            <span className="g-form-label">Username</span>
            <input
              className="g-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="ggec@gmail.com"
            />
          </label>
          <label>
            <span className="g-form-label">Password</span>
            <input
              type="password"
              className="g-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Anubhav@123"
            />
          </label>
          {error ? (
            <p style={{ color: "#fda4af", margin: 0, fontSize: "0.8rem" }} role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="g-btn-primary"
            style={{ width: "100%", marginTop: "0.25rem", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.85 : 1 }}
            disabled={busy}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
