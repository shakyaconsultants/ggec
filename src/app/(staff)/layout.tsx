"use client";

import { StaffGate } from "@/components/staff/staff-gate";
import { StaffShell } from "@/components/staff/staff-shell";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffGate>
      <StaffShell>{children}</StaffShell>
    </StaffGate>
  );
}
