"use client";

import { AdminGate } from "@/components/staff/staff-gate";
import { StaffShell } from "@/components/staff/staff-shell";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <StaffShell>{children}</StaffShell>
    </AdminGate>
  );
}
