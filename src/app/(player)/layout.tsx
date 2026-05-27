"use client";

import { UserGate } from "@/components/player/user-gate";
import { UserShell } from "@/components/player/user-shell";

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserGate>
      <UserShell>{children}</UserShell>
    </UserGate>
  );
}
