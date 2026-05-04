import { DM_Sans, Orbitron } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const display = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "GGEC — Gaming Zone",
  description: "Golden Gate Entertainment Center — console & PC gaming, billing, and stats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-zinc-100">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
