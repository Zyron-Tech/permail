"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "bg-wine text-sun" : "text-ash hover:bg-shell hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card sm:hidden"
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
              className="flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium"
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                  active ? "bg-wine text-sun" : "text-ash"
                }`}
              >
                <Icon />
              </span>
              <span className={active ? "text-wine" : "text-ash"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
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
