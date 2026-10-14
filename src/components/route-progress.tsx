"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLinkStatus } from "next/link";

/**
 * The thin bar across the top of the window during a navigation.
 *
 * App Router dropped router events, and `useLinkStatus` only reports for the
 * one <Link> it sits inside — which would mean touching every link in the
 * product. Instead this listens for clicks and submits at the document, decides
 * whether they will navigate, and clears itself when the pathname lands. That
 * covers links, list rows, and the server-action forms behind "New campaign"
 * without any of them knowing about it.
 *
 * The bar creeps toward 88% while waiting rather than pretending to know how
 * far along it is, then snaps to 100% and fades.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const running = useRef(false);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  useEffect(() => {
    function start() {
      if (running.current) return;
      running.current = true;
      clearTimers();
      setVisible(true);
      setWidth(10);
      timers.current.push(window.setTimeout(() => setWidth(62), 80));
      timers.current.push(window.setTimeout(() => setWidth(88), 480));
      // Nothing should hang the bar on screen for ever.
      timers.current.push(window.setTimeout(finish, 12000));
    }

    function finish() {
      if (!running.current) return;
      running.current = false;
      clearTimers();
      setWidth(100);
      timers.current.push(
        window.setTimeout(() => {
          setVisible(false);
          setWidth(0);
        }, 260),
      );
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page: React will not re-render anything worth waiting for.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      // Sign-out posts a normal request; the browser's own spinner covers it.
      if (!form) return;
      if (form.method.toLowerCase() === "post" && form.action.includes("/auth/")) return;
      start();
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("permail:navigating", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("permail:navigating", start);
      clearTimers();
    };
  }, []);

  // The new route has rendered — wherever the bar had got to, it is done.
  useEffect(() => {
    if (!running.current) return;
    running.current = false;
    clearTimers();
    setWidth(100);
    const id = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 260);
    return () => clearTimeout(id);
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2.5px]"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <div
        className="h-full bg-pine"
        style={{
          width: `${width}%`,
          transition: "width 0.4s cubic-bezier(0.1, 0.7, 0.2, 1)",
          boxShadow: "0 0 10px rgb(14 59 46 / 0.5)",
        }}
      />
    </div>
  );
}

/**
 * Dropped inside a <Link> to show which one is actually working. Unlike the bar
 * above, this is per-link and comes straight from the router.
 */
export function LinkSpinner({ className = "" }: { className?: string }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span
      className={`inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-current border-t-transparent ${className}`}
      aria-label="Loading"
    />
  );
}

/** For navigations with no click to observe — router.push, mostly. */
export function signalNavigating() {
  window.dispatchEvent(new Event("permail:navigating"));
}
