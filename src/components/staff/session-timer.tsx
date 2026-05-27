"use client";

import { useEffect, useState } from "react";
import { formatElapsed } from "@/lib/pricing";

export function SessionTimer({ startedAt, className }: { startedAt: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatElapsed(startedAt, now)}
    </span>
  );
}
