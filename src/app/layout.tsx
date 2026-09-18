import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Fonts are self-hosted (latin variable subsets, ~100 KB total) rather than
 * pulled from Google at build time. Builds stay hermetic and offline-capable,
 * and there is no third-party request on page load.
 */
const display = localFont({
  src: "./fonts/SpaceGrotesk.woff2",
  variable: "--ff-display",
  weight: "500 700",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const sans = localFont({
  src: "./fonts/Inter.woff2",
  variable: "--ff-sans",
  weight: "400 700",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
});

const grotesk = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--ff-grotesk",
  weight: "100 900",
  display: "swap",
  fallback: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
});

const mono = localFont({
  src: "./fonts/JetBrainsMono.woff2",
  variable: "--ff-mono",
  weight: "400 500",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const metadata: Metadata = {
  title: "Permail — bulk email that reads like it was written for one person",
  description:
    "Connect your Gmail, bring a list with as many columns as you need, and send one personalised message to everyone at once — each as a separate email from your own address.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
