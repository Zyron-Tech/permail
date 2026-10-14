"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { useLinkStatus } from "next/link";
import { LinkSpinner } from "@/components/route-progress";

const ITEMS = [
  { href: "/app", label: "Home", icon: HomeIcon, match: (p: string) => p === "/app" },
  {
    href: "/app/campaigns",
    label: "Campaigns",
    icon: MailIcon,
    match: (p: string) => p.startsWith("/app/campaigns"),
  },
  {
    href: "/app/audiences",
    label: "Audiences",
    icon: PeopleIcon,
    match: (p: string) => p.startsWith("/app/audiences"),
  },
  {
    href: "/app/guide",
    label: "Guide",
    icon: BookIcon,
    match: (p: string) => p.startsWith("/app/guide"),
  },
];

/**
 * One pill that travels between the tabs rather than four that switch on and
 * off. It is measured from the active link, so it stays right through font
 * loading and window resizes, and it only animates once it has a position —
 * otherwise it would slide in from the left on first paint.
 */
export function DesktopNav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    function place() {
      const active = list!.querySelector<HTMLElement>("[data-active='true']");
      if (!active) return setPill(null);
      setPill({ x: active.offsetLeft, w: active.offsetWidth });
    }

    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    document.fonts?.ready.then(place).catch(() => {});
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div ref={listRef} className="relative hidden items-center gap-1 sm:flex">
      {pill ? (
        <span
          aria-hidden="true"
          className="absolute top-0 h-full rounded-full bg-pine"
          style={{
            transform: `translateX(${pill.x}px)`,
            width: pill.w,
            transition: "transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        />
      ) : null}

      {ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            data-active={active}
            aria-current={active ? "page" : undefined}
            className={`relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
              active ? "text-cream" : "text-ash hover:text-ink"
            }`}
          >
            {item.label}
            {/* Sits in the pill's own padding, so showing it moves nothing. */}
            <LinkSpinner className="absolute right-0.5 top-1/2 -translate-y-1/2" />
          </Link>
        );
      })}
    </div>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium"
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-200 ${
                  active ? "scale-100 bg-pine text-cream" : "scale-95 text-mist"
                }`}
              >
                {/* The spinner takes the icon's place, so the bar never jumps. */}
                <PendingIcon Icon={Icon} />
              </span>
              <span
                className={`transition-colors duration-200 ${active ? "text-pine" : "text-mist"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PendingIcon({ Icon }: { Icon: () => React.JSX.Element }) {
  const { pending } = useLinkStatus();
  return pending ? (
    <span
      className="h-[15px] w-[15px] animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
      aria-label="Loading"
    />
  ) : (
    <Icon />
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8 } as const;

function HomeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5.5H9V20H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <circle cx="9" cy="8" r="3.4" />
      <path d="M2.8 19.5c.6-3.4 3.1-5.4 6.2-5.4s5.6 2 6.2 5.4" />
      <path d="M16.4 5.2a3.4 3.4 0 0 1 0 6.4M17.5 14.6c2.1.5 3.5 2.3 3.9 4.9" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" {...stroke}>
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z"
        strokeLinejoin="round"
      />
      <path d="M12 5v14" />
    </svg>
  );
}
