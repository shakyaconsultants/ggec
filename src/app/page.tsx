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
          <Link
            href="/login"
            className="g-btn-primary"
          >
            Center management login
          </Link>
        </div>
      </header>

      <main className="g-container" style={{ padding: "1.4rem 0 2.2rem" }}>
        <section className="g-grid-2" style={{ alignItems: "stretch" }}>
          <div className="g-card" style={{ overflow: "hidden", padding: 0 }}>
            <Image
              src={hero}
              alt="Gaming setup with controller and ambient lighting"
              priority
              width={900}
              height={580}
              style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 320 }}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="g-card" style={{ padding: "1.5rem 1.4rem" }}>
            <p style={{ margin: 0, color: "#34d399", letterSpacing: "0.18em", fontSize: "0.74rem", textTransform: "uppercase", fontWeight: 700 }}>
              Gaming zone
            </p>
            <h1 className="font-display g-title" style={{ marginTop: "0.7rem" }}>
              Golden Gate
              <br />
              Entertainment Center
            </h1>
            <p className="g-muted" style={{ marginTop: "0.9rem", maxWidth: 560, lineHeight: 1.6 }}>
              PS2 through PS5 and high-spec PC stations. Fair hourly pricing, quick billing for
              staff, and a dashboard for what your players love most.
            </p>
            <ul className="g-list" style={{ marginTop: "1rem", display: "grid", gap: "0.55rem", color: "#d4d4d8", fontSize: "0.93rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#34d399", display: "inline-block" }} />
                Console lanes + PC &quot;system&quot; booths
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#34d399", display: "inline-block" }} />
                Auto-calculated bills by duration
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "#34d399", display: "inline-block" }} />
                Peak hours, top games &amp; localities
              </li>
            </ul>
            <Link
              href="/login"
              className="g-btn-ghost font-display"
              style={{ marginTop: "1.15rem" }}
            >
              Open center management
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="g-grid-2" style={{ marginTop: "1rem" }}>
          <div className="g-card" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ minHeight: 260 }}>
              <Image
                src={side}
                alt="Esports and multiplayer gaming atmosphere"
                width={900}
                height={620}
                style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 260 }}
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="g-card" style={{ display: "grid", alignContent: "center", gap: "0.7rem" }}>
            <h2 className="font-display" style={{ margin: 0, fontSize: "1.3rem" }}>Built for busy sessions</h2>
            <p className="g-muted" style={{ margin: 0, lineHeight: 1.6 }}>
              Track every visit with name, phone, locality, station type, and play time.
              Stats stay on this browser so you can run counter operations fast.
            </p>
          </div>
        </section>

        <footer style={{ marginTop: "1.4rem", padding: "1rem 0", borderTop: "1px solid #27272a", textAlign: "center", color: "#71717a", fontSize: "0.78rem" }}>
          GGEC · Photos via Unsplash (replace with your own assets anytime)
        </footer>
      </main>
    </div>
  );
}
