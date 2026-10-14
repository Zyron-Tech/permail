"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signalNavigating } from "@/components/route-progress";

export type PaletteItem = {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: "Go to" | "Campaigns" | "Audiences";
};

const NAV: PaletteItem[] = [
  { id: "nav-home", label: "Home", hint: "Progress and recent sends", href: "/app", group: "Go to" },
  { id: "nav-campaigns", label: "Campaigns", hint: "Drafts and delivery reports", href: "/app/campaigns", group: "Go to" },
  { id: "nav-audiences", label: "Audiences", hint: "Your recipient sheets", href: "/app/audiences", group: "Go to" },
  { id: "nav-guide", label: "Guide", hint: "Merge tags, imports, limits", href: "/app/guide", group: "Go to" },
  { id: "nav-settings", label: "Settings", hint: "Sending account", href: "/app/settings", group: "Go to" },
];

/** Subsequence match, so "spout" finds "Spring outreach". */
function matches(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const target = haystack.toLowerCase();
  let at = 0;
  for (const char of needle.toLowerCase()) {
    at = target.indexOf(char, at);
    if (at === -1) return false;
    at += 1;
  }
  return true;
}

export function CommandPalette({ items }: { items: PaletteItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const all = useMemo(() => [...NAV, ...items], [items]);
  const results = useMemo(
    () => all.filter((item) => matches(`${item.label} ${item.hint}`, query)).slice(0, 12),
    [all, query],
  );

  // ⌘K / Ctrl-K from anywhere, except while typing somewhere else.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setCursor(0);
      return;
    }
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  useEffect(() => {
    function openPalette() {
      setOpen(true);
    }
    window.addEventListener("permail:palette", openPalette);
    return () => window.removeEventListener("permail:palette", openPalette);
  }, []);

  function go(item: PaletteItem | undefined) {
    if (!item) return;
    setOpen(false);
    signalNavigating();
    router.push(item.href);
  }

  if (!open) return null;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-ink/25 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      <div className="card rise relative w-full max-w-lg overflow-hidden border-line p-0 shadow-[0_1px_2px_rgb(18_17_16/0.06),0_32px_64px_-24px_rgb(18_17_16/0.3)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(results[cursor]);
              }
            }}
            placeholder="Search campaigns, audiences, pages…"
            className="w-full bg-transparent py-3.5 text-[15px] text-ink outline-none placeholder:text-mist"
          />
          <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-mist sm:block">
            esc
          </kbd>
        </div>

        {results.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-mist">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
            {results.map((item, index) => {
              const header = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;

              return (
                <li key={item.id}>
                  {header ? (
                    <p className="px-2.5 pb-1 pt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mist first:pt-1.5">
                      {header}
                    </p>
                  ) : null}
                  <button
                    onMouseMove={() => setCursor(index)}
                    onClick={() => go(item)}
                    className={`flex w-full items-center gap-3 rounded-[7px] px-2.5 py-2.5 text-left transition-colors ${
                      index === cursor ? "bg-pine text-cream" : "text-ink"
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{item.label}</span>
                      <span
                        className={`block truncate text-[12px] ${
                          index === cursor ? "text-cream/65" : "text-mist"
                        }`}
                      >
                        {item.hint}
                      </span>
                    </span>
                    {index === cursor ? (
                      <span className="font-mono text-[10px] text-cream/60">↵</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** The header button. Separate so the palette itself stays unmounted until used. */
export function PaletteTrigger() {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("permail:palette"))}
      className="group hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[13px] text-mist transition-colors hover:border-pine hover:text-ink md:flex"
      aria-label="Search"
    >
      <SearchIcon />
      <span>Search</span>
      <kbd className="ml-1 rounded border border-line px-1.5 font-mono text-[10px] leading-4">
        {mac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}
