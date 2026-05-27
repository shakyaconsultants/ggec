import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_FULL_NAME, BRAND_NAME, CAFE_HOURS } from "@/lib/brand";

export function HomeFooter() {
  return (
    <footer className="g-home-footer">
      <div className="g-container">
        <div className="g-home-footer-grid">
          <div className="g-home-footer-brand">
            <BrandLogo href="/" size="md" showTagline />
            <p className="g-muted g-home-footer-about">
              {BRAND_FULL_NAME} — a premium gaming lounge built for serious sessions, squad nights,
              and zero billing confusion.
            </p>
            <p className="g-home-footer-hours">{CAFE_HOURS}</p>
          </div>

          <div>
            <h3 className="g-home-footer-heading">Explore</h3>
            <ul className="g-home-footer-list">
              <li><a href="#stations">Stations</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href="#menu">Cafe & menu</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="g-home-footer-heading">Account</h3>
            <ul className="g-home-footer-list">
              <li><Link href="/login">Member login</Link></li>
              <li><Link href="/login">Staff portal</Link></li>
              <li><a href="#faq">Help & FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="g-home-footer-heading">Visit</h3>
            <ul className="g-home-footer-list">
              <li>Walk-ins welcome</li>
              <li>Group bookings on request</li>
              <li>Tournament nights</li>
            </ul>
          </div>
        </div>

        <div className="g-home-footer-bottom">
          <p className="g-muted">© {new Date().getFullYear()} {BRAND_FULL_NAME}. All rights reserved.</p>
          <p className="g-home-footer-mark font-display">{BRAND_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
