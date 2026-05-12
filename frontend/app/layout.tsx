import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";

import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument"
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "WatchDog",
  description: "AI-powered observability dashboard for WatchDog."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${instrument.variable} ${manrope.variable}`}>
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(110,231,255,0.15),rgba(15,23,42,0))]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.18),rgba(15,23,42,0))]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.9),rgba(15,23,42,0.6))]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
