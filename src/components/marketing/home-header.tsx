"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

const links = [
  { href: "#stations", label: "Stations" },
  { href: "#experience", label: "Experience" },
  { href: "#menu", label: "Cafe" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="g-header g-home-header">
      <div className="g-container g-home-header-inner">
        <BrandLogo href="/" size="lg" showTagline />

        <nav className={`g-home-nav${open ? " is-open" : ""}`} aria-label="Main">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="g-home-nav-link"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/login" className="g-btn-primary g-home-nav-cta" onClick={() => setOpen(false)}>
            Member login
          </Link>
        </nav>

        <button
          type="button"
          className="g-home-menu-btn"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
