"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BRAND_NAME, LOGO_PATH } from "@/lib/brand";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: { w: 160, h: 48, className: "g-brand-logo--sm" },
  md: { w: 200, h: 60, className: "g-brand-logo--md" },
  lg: { w: 260, h: 78, className: "g-brand-logo--lg" },
  xl: { w: 320, h: 96, className: "g-brand-logo--xl" },
} as const;

export function BrandLogo({
  href,
  size = "md",
  showName = true,
  showTagline = false,
  className = "",
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);
  const dim = sizes[size];

  const inner = (
    <span className={`g-brand-logo ${dim.className} ${className}`.trim()}>
      {!imgError ? (
        <span className="g-brand-logo-mark">
          <Image
            src={LOGO_PATH}
            alt={`${BRAND_NAME} logo`}
            width={dim.w}
            height={dim.h}
            className="g-brand-logo-img"
            onError={() => setImgError(true)}
            priority={size === "lg" || size === "xl"}
          />
        </span>
      ) : (
        <span className="g-brand-logo-fallback font-display" aria-hidden="true">
          G
        </span>
      )}
      {showName || showTagline ? (
        <span className="g-brand-logo-copy">
          {showName ? <span className="g-brand-logo-text font-display">{BRAND_NAME}</span> : null}
          {showTagline ? <span className="g-brand-logo-tagline">Gaming Cafe</span> : null}
        </span>
      ) : null}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="g-brand-logo-link" aria-label={`${BRAND_NAME} home`}>
        {inner}
      </Link>
    );
  }

  return inner;
}
