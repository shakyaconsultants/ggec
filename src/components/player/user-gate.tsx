"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/components/providers/app-providers";

export function UserGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isUser) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isUser, router]);

  if (!isAuthenticated || !isUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
