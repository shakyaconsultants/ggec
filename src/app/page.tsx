import Image from "next/image";
import Link from "next/link";

const hero =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80";
const side =
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80";

export default function Home() {
  return (
    <div className="g-shell">
      <header className="g-header">
        <div className="g-container g-row" style={{ minHeight: 68 }}>
          <span className="font-display" style={{ color: "#34d399", fontSize: "1.1rem", fontWeight: 700 }}>
            GGEC Gaming Center
          </span>
          <Link href="/login" className="g-btn-primary">
            Center management login
          </Link>
        </div>
      </header>

      <main className="g-container" style={{ paddingBottom: "2rem" }}>
        <section className="g-hero">
          <div className="g-card" style={{ padding: "1.35rem" }}>
            <p className="g-eyebrow">Premium gaming lounge</p>
            <h1 className="font-display g-title" style={{ marginTop: "0.65rem" }}>
              Golden Gate Entertainment Center
            </h1>
            <p className="g-lead">
              Console and PC stations with fair pricing, fast billing, and a smooth customer
              experience. Walk in, pick your setup, and start playing in minutes.
            </p>

            <div className="g-actions">
              <Link href="/login" className="g-btn-primary">
                Book staff desk
              </Link>
              <a href="#experience" className="g-btn-ghost">
                See customer experience
              </a>
            </div>

            <div className="g-stat-grid">
              <div className="g-stat-box">
                <p className="g-stat-label">Platforms</p>
                <p className="g-stat-value">PS2 to PS5 + PC</p>
              </div>
              <div className="g-stat-box">
                <p className="g-stat-label">Session flexibility</p>
                <p className="g-stat-value">Hourly billing</p>
              </div>
              <div className="g-stat-box">
                <p className="g-stat-label">Peak handling</p>
                <p className="g-stat-value">Counter ready</p>
              </div>
            </div>
          </div>

          <div className="g-hero-visual">
            <Image
              src={hero}
              alt="Gaming setup with controller and ambient lighting"
              priority
              width={960}
              height={680}
              style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 360 }}
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </div>
        </section>

        <section id="experience" className="g-card" style={{ marginTop: "0.2rem" }}>
          <p className="g-eyebrow">Why players return</p>
          <h2 className="font-display" style={{ margin: "0.55rem 0 0", fontSize: "1.55rem" }}>
            Comfortable setup. Transparent pricing. Reliable sessions.
          </h2>
          <div className="g-feature-grid">
            <article className="g-feature-card">
              <h3>High comfort stations</h3>
              <p>
                Dedicated console lanes and optimized PC booths designed for longer sessions and
                smoother multiplayer gameplay.
              </p>
            </article>
            <article className="g-feature-card">
              <h3>Fair and clear billing</h3>
              <p>
                Hour-based pricing with exact duration tracking so every customer bill stays clear,
                consistent, and easy to trust.
              </p>
            </article>
            <article className="g-feature-card">
              <h3>Fast counter operations</h3>
              <p>
                Staff can quickly start sessions, create bills, and review top games and peak
                windows without slowing down service.
              </p>
            </article>
          </div>
        </section>

        <section className="g-cta-strip">
          <h2 className="font-display">Planning your next gaming session?</h2>
          <p>
            Visit GGEC for console classics, modern titles, and smooth local multiplayer setups.
            Staff can access desk controls from the center-management login.
          </p>
          <div className="g-actions" style={{ marginTop: "0.9rem" }}>
            <Link href="/login" className="g-btn-primary">
              Open staff console
            </Link>
          </div>
        </section>

        <div className="g-card" style={{ marginTop: "1rem", overflow: "hidden", padding: 0 }}>
          <Image
            src={side}
            alt="Esports and multiplayer gaming atmosphere"
            width={1200}
            height={460}
            style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 220, maxHeight: 320 }}
            sizes="100vw"
          />
        </div>

        <footer className="g-footer">
          GGEC · Photos via Unsplash (replace with your own assets anytime)
        </footer>
      </main>
    </div>
  );
}
