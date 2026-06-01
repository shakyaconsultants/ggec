import Image from "next/image";
import Link from "next/link";
import { HomeFooter } from "@/components/marketing/home-footer";
import { HomeHeader } from "@/components/marketing/home-header";
import { BrandLogo } from "@/components/brand/brand-logo";
import {
  BRAND_FULL_NAME,
  BRAND_NAME,
  BRAND_TAGLINE,
  CAFE_HOURS,
  CAFE_TAGLINE_SHORT,
  MARKETING_STATS,
} from "@/lib/brand";
import { GAMING_PRICING_SUMMARY, MIN_SESSION_CHARGE } from "@/lib/pricing";

const hero =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=85";
const lounge =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=85";
const setup =
  "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1400&q=85";
const esports =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85";

const platforms = [
  { code: "PS2", name: "PlayStation 2", detail: "Retro classics, party games, and nostalgia runs.", accent: "#a855f7" },
  { code: "PS3", name: "PlayStation 3", detail: "HD favourites and smooth local co-op sessions.", accent: "#3b82f6" },
  { code: "PS4", name: "PlayStation 4", detail: "Modern blockbusters and online-ready setups.", accent: "#06b6d4" },
  { code: "PS5", name: "PlayStation 5", detail: "Next-gen visuals with premium controllers.", accent: "#10b981" },
  { code: "PC", name: "PC / System", detail: "Competitive titles, indies, and long-session comfort.", accent: "#ef4444" },
];

const steps = [
  { step: "01", title: "Walk in & check in", text: "Front desk creates your profile once. Returning members jump straight to a station." },
  { step: "02", title: "Pick your platform", text: "Choose PS2 through PS5 or PC. One active session, one clear timer — no guesswork." },
  { step: "03", title: "Play, eat, checkout", text: "Order from the cafe menu during play. Gaming + food on one professional invoice." },
];

const amenities = [
  { icon: "◈", title: "Premium stations", text: "Clean rigs, tuned displays, and controllers ready before you sit down." },
  { icon: "◎", title: "Ambient lounge", text: "Neon-lit atmosphere designed for long sessions and squad hangouts." },
  { icon: "▣", title: "Cafe menu", text: "Snacks and drinks added to your tab without breaking your game flow." },
  { icon: "◉", title: "Smart billing", text: "Minimum Rs 100 first hour, then tiered per-minute pricing with precise session timing." },
  { icon: "◇", title: "Member dashboard", text: "Track hours, spend, favourite stations, and every invoice online." },
  { icon: "✦", title: "Event-ready", text: "Birthdays, mini tourneys, and group nights — we scale with your crew." },
];

const faqs = [
  {
    q: "Do I need an account to play?",
    a: "Staff create your member profile on first visit. After that, sign in anytime to view stats and invoices.",
  },
  {
    q: "How does pricing work?",
    a: GAMING_PRICING_SUMMARY + " Food is added separately and appears on the same invoice.",
  },
  {
    q: "Can I order food during a session?",
    a: "Yes. Add items from the cafe menu while you play — everything is consolidated when your session ends.",
  },
  {
    q: "Is there a staff login?",
    a: "Staff use the same sign-in page with admin credentials to run sessions, food orders, and billing.",
  },
];

export default function Home() {
  return (
    <div className="g-shell g-home-shell">
      <HomeHeader />

      <main>
        <section className="g-home-hero-premium">
          <div className="g-home-hero-bg" aria-hidden="true">
            <Image src={hero} alt="" fill priority className="g-home-hero-bg-image" sizes="100vw" />
            <div className="g-home-hero-bg-shade" />
            <div className="g-home-hero-bg-glow" />
          </div>

          <div className="g-container g-home-hero-premium-inner">
            <div className="g-home-hero-content">
              <div className="g-home-hero-badge-row">
                <span className="g-home-live-pill">
                  <span className="g-home-live-dot" aria-hidden="true" />
                  Now open · {CAFE_HOURS}
                </span>
              </div>

              <h1 className="font-display g-home-hero-headline">
                {CAFE_TAGLINE_SHORT}
                <span className="g-home-hero-headline-accent"> Welcome to {BRAND_NAME}.</span>
              </h1>

              <p className="g-home-hero-desc">
                {BRAND_TAGLINE}. From retro PS2 nights to PS5 and PC grinds — {BRAND_FULL_NAME} delivers
                a high-end lounge experience with professional billing, cafe service, and member tools
                built in.
              </p>

              <div className="g-actions g-home-hero-actions">
                <Link href="/login" className="g-btn-primary g-btn-lg">
                  Member login
                </Link>
                <a href="#stations" className="g-btn-ghost g-btn-lg">
                  View stations
                </a>
              </div>
            </div>

            <div className="g-home-hero-panel">
              <div className="g-home-hero-panel-top">
                <BrandLogo size="lg" showName={false} />
                <p className="g-home-hero-panel-label">From</p>
                <p className="g-home-hero-panel-price font-display">Rs {MIN_SESSION_CHARGE}</p>
                <p className="g-muted g-home-hero-panel-note">minimum · first hour · all platforms</p>
              </div>
              <ul className="g-home-hero-panel-list">
                <li>PS2 · PS3 · PS4 · PS5 · PC</li>
                <li>Cafe menu on session tab</li>
                <li>Digital invoices & profiles</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="g-home-stats-bar" aria-label="Highlights">
          <div className="g-container g-home-stats-grid">
            {MARKETING_STATS.map((stat) => (
              <div key={stat.label} className="g-home-stat-item">
                <span className="g-home-stat-value font-display">{stat.value}</span>
                <span className="g-home-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="g-home-marquee" aria-hidden="true">
          <div className="g-home-marquee-track">
            {[...Array(2)].map((_, i) => (
              <span key={i}>
                PS2 · PS3 · PS4 · PS5 · PC · CAFE · TOURNAMENTS · MEMBER PROFILES · SMART BILLING ·{" "}
              </span>
            ))}
          </div>
        </section>

        <section id="stations" className="g-container g-home-section g-home-section-spaced">
          <div className="g-home-section-head g-home-section-head-center">
            <p className="g-eyebrow">Gaming floor</p>
            <h2 className="font-display g-home-section-title">Five platforms. One premium lounge.</h2>
            <p className="g-muted g-home-section-sub">
              Every generation under one roof — pick your lane and play without compromise.
            </p>
          </div>

          <div className="g-home-platform-grid g-home-platform-grid-premium">
            {platforms.map((platform) => (
              <article
                key={platform.code}
                className="g-home-platform-card g-home-platform-card-premium"
                data-platform={platform.code}
              >
                <span className="g-home-platform-code font-display">{platform.code}</span>
                <h3>{platform.name}</h3>
                <p>{platform.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="g-home-band g-home-band-premium">
          <div className="g-container">
            <div className="g-home-section-head">
              <p className="g-eyebrow">How it works</p>
              <h2 className="font-display g-home-section-title">Seamless from walk-in to invoice</h2>
            </div>
            <div className="g-home-steps">
              {steps.map((item) => (
                <article key={item.step} className="g-home-step-card">
                  <span className="g-home-step-num font-display">{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="g-container g-home-section">
          <div className="g-home-split">
            <div className="g-home-split-copy">
              <p className="g-eyebrow">The {BRAND_NAME} standard</p>
              <h2 className="font-display g-home-section-title">
                Built like a flagship gaming cafe — not a side hustle
              </h2>
              <p className="g-muted g-home-section-sub">
                We obsess over the details players feel: seat comfort, station hygiene, lighting,
                service speed, and billing clarity. That is what keeps squads coming back.
              </p>
            </div>
            <div className="g-home-amenity-grid g-home-amenity-grid-premium">
              {amenities.map((item) => (
                <article key={item.title} className="g-home-amenity-card g-home-amenity-card-premium">
                  <span className="g-home-amenity-icon" aria-hidden="true">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="menu" className="g-container g-home-gallery g-home-gallery-premium">
          <div className="g-home-gallery-card g-home-gallery-card-tall">
            <Image src={lounge} alt="GGEZZ multiplayer lounge" fill className="g-home-gallery-image" sizes="(max-width: 900px) 100vw, 33vw" />
            <div className="g-home-gallery-caption">
              <p className="g-eyebrow">Lounge</p>
              <h3>Squad-ready spaces</h3>
              <p>Local multiplayer, watch parties, and casual drop-ins every day.</p>
            </div>
          </div>
          <div className="g-home-gallery-card">
            <Image src={setup} alt="Pro gaming station at GGEZZ" fill className="g-home-gallery-image" sizes="(max-width: 900px) 100vw, 33vw" />
            <div className="g-home-gallery-caption">
              <p className="g-eyebrow">Stations</p>
              <h3>Pro-grade setups</h3>
              <p>Tuned displays, responsive controls, fast session starts.</p>
            </div>
          </div>
          <div className="g-home-gallery-card">
            <Image src={esports} alt="Tournament and esports atmosphere" fill className="g-home-gallery-image" sizes="(max-width: 900px) 100vw, 33vw" />
            <div className="g-home-gallery-caption">
              <p className="g-eyebrow">Cafe</p>
              <h3>Fuel your session</h3>
              <p>Snacks and drinks added to your tab — one invoice at checkout.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="g-container g-home-section">
          <div className="g-home-pricing-card g-home-pricing-card-premium">
            <div className="g-home-pricing-copy">
              <p className="g-eyebrow">Transparent pricing</p>
              <h2 className="font-display g-home-section-title">Fair tiers. Every station. Zero confusion.</h2>
              <p className="g-muted g-home-pricing-desc">
                Start at Rs {MIN_SESSION_CHARGE} for your first hour on any platform. After that, tiered
                per-minute pricing applies each hour. Food orders stack cleanly on your final bill.
              </p>
              <ul className="g-home-pricing-features">
                <li>Rs 100 per completed hour (2h = Rs 200, 3h = Rs 300)</li>
                <li>Mid-hour exit: Rs 2/min for up to 45 min (1h 40m = Rs 180)</li>
                <li>Minute-accurate session tracking</li>
                <li>Food + gaming on one invoice</li>
                <li>Full history in your member dashboard</li>
              </ul>
            </div>
            <div className="g-home-price-box g-home-price-box-premium">
              <span className="g-home-price-label">Starting from</span>
              <span className="g-home-price-value font-display">Rs {MIN_SESSION_CHARGE}</span>
              <span className="g-home-price-note">first hour · tiered after that</span>
              <Link href="/login" className="g-btn-primary g-home-price-cta">
                Access your profile
              </Link>
            </div>
          </div>
        </section>

        <section id="faq" className="g-container g-home-section">
          <div className="g-home-section-head g-home-section-head-center">
            <p className="g-eyebrow">FAQ</p>
            <h2 className="font-display g-home-section-title">Questions before you queue up</h2>
          </div>
          <div className="g-home-faq-grid">
            {faqs.map((item) => (
              <article key={item.q} className="g-home-faq-card">
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="g-container g-home-cta">
          <div className="g-home-cta-card g-home-cta-card-premium">
            <div className="g-home-cta-glow" aria-hidden="true" />
            <div className="g-home-cta-logo">
              <BrandLogo size="xl" showName={false} />
            </div>
            <div>
              <h2 className="font-display g-home-cta-title">Your next session starts at {BRAND_NAME}</h2>
              <p className="g-muted g-home-cta-text">
                Members sign in to view profiles, stats, and invoices. Staff manage the floor from
                the same portal with admin access.
              </p>
              <div className="g-actions">
                <Link href="/login" className="g-btn-primary g-btn-lg">
                  Sign in now
                </Link>
                <a href="#stations" className="g-btn-ghost g-btn-lg">
                  See stations
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  );
}
