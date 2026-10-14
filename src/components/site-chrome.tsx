import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";

/**
 * The public site's header, built as a material rather than a bar.
 *
 * Over the hero it is barely there — the pine runs straight up behind it, so
 * the page opens as one surface instead of a strip plus a page. Once content
 * has actually slid underneath, it thickens into glass and earns its
 * separation with a short fade rather than the 1px rule that used to sit
 * there. Blur and background arrive together, so it reads as a pane of
 * something sliding in rather than a rectangle turning opaque.
 *
 * All of that lives in `.glass-chrome` in globals.css, driven by a
 * scroll-timeline animation, which is why this file has no "use client" and
 * ships no JavaScript. The important consequence is the direction it fails in:
 * the *un*-animated state is the opaque one, so a browser without
 * scroll-timeline support still gets a legible header instead of a transparent
 * one with body copy sliding under it.
 */

const SHELL = "mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12";

const LINKS = [
  ["How it works", "#method"],
  ["What you get", "#guarantees"],
  ["Questions", "#questions"],
] as const;

export function SiteHeader() {
  return (
    <header className="glass-chrome sticky top-0 z-30 text-cream">
      <div className={`${SHELL} flex h-16 items-center justify-between gap-6`}>
        <Wordmark />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(([label, href]) => (
            <a key={label} href={href} className="press text-[13.5px] text-cream/65 hover:text-cream">
              {label}
            </a>
          ))}
        </nav>

        <SignInButton className="mbtn mbtn-sm mbtn-brass" label="Sign in" />
      </div>
    </header>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`press flex items-baseline gap-[3px] text-current ${className}`}>
      <span className="type-wordmark text-current">Permail</span>
      <span className="h-[5px] w-[5px] rounded-full bg-sun" />
    </Link>
  );
}
