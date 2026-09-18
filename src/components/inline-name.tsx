"use client";

import { useState, useTransition } from "react";

export function InlineName({
  initial,
  onSave,
  className = "",
  placeholder = "Untitled",
}: {
  initial: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();

  function commit() {
    const trimmed = value.trim();
    if (trimmed === initial) return;
    startTransition(async () => {
      await onSave(trimmed);
    });
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      placeholder={placeholder}
      spellCheck={false}
      className={`w-full rounded-lg border border-transparent bg-transparent px-2 py-1 -ml-2 font-display text-3xl font-bold tracking-tight text-ink outline-none transition-colors hover:border-line focus:border-wine focus:bg-card sm:text-4xl ${className}`}
    />
  );
}
