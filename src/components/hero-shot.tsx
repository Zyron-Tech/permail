"use client";

import { useEffect, useState } from "react";

const ROWS = [
  { first_name: "Amara", company: "Kite Studio", city: "Lagos", domain: "kite.studio" },
  { first_name: "Tobias", company: "Northwind", city: "Berlin", domain: "northwind.co" },
  { first_name: "Dana", company: "Fold & Co", city: "Lisbon", domain: "fold.co" },
  { first_name: "Wei", company: "Bright Lab", city: "Taipei", domain: "brightlab.tw" },
];

/**
 * The composer, drawn from the same tokens as the product rather than captured
 * as a bitmap: sharp at any density, weightless to download, and it can never
 * drift out of date with the real UI. The right pane cycles so you watch one
 * draft become four different letters.
 */
export function ComposerShot() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % ROWS.length), 3200);
    return () => clearInterval(timer);
  }, []);

  const row = ROWS[index];

  return (
    <div className="overflow-hidden rounded-[6px] border border-hair bg-snow shadow-[0_1px_2px_rgba(18,17,16,0.04),0_24px_48px_-32px_rgba(18,17,16,0.22)]">
      <div className="flex items-center gap-3 border-b border-hair px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">
          Spring outreach
        </span>
        <span className="ml-auto flex items-center gap-2 font-mono text-[10px] text-stone">
          <span className="h-1 w-1 rounded-full bg-wine" />
          248 recipients
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* the one draft */}
        <div className="border-b border-hair p-5 md:border-b-0 md:border-r md:p-7">
          <p className="kicker">Your draft</p>

          <Field label="Subject" />
          <p className="font-mono text-[12.5px] leading-relaxed text-graphite">
            A note about <Tag>company</Tag>
          </p>

          <Field label="Message" />
          <p className="font-mono text-[12.5px] leading-[2] text-graphite">
            Hi <Tag>first_name</Tag>,
            <br />
            <br />
            I came across <Tag>company</Tag> while reading about the studio scene in{" "}
            <Tag>city</Tag> and wanted to say hello.
          </p>
        </div>

        {/* what each person actually receives */}
        <div className="bg-bone p-5 md:p-7">
          <div className="flex items-baseline justify-between">
            <p className="kicker">What lands</p>
            <span className="font-mono text-[10px] tabular-nums text-stone">
              {String(index + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")}
            </span>
          </div>

          <div key={index} className="rise">
            <Field label="To" />
            <p className="truncate font-mono text-[12.5px] text-slate">
              {row.first_name.toLowerCase()}@{row.domain}
            </p>

            <p className="mt-6 text-[14px] font-semibold leading-snug text-graphite">
              A note about {row.company}
            </p>

            <p className="mt-3 text-[13.5px] leading-[1.8] text-slate">
              Hi {row.first_name},
              <br />
              <br />I came across {row.company} while reading about the studio scene in {row.city}{" "}
              and wanted to say hello.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-hair px-4 py-3">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-moss text-white">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="m4 12.5 5.5 5.5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[12.5px] text-graphite">248 delivered</span>
        <span className="ml-auto font-mono text-[10px] text-stone">248 separate emails</span>
      </div>
    </div>
  );
}

function Field({ label }: { label: string }) {
  return (
    <p className="mb-2 mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-stone first-of-type:mt-5">
      {label}
    </p>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[3px] bg-wine/[0.06] px-1 py-0.5 text-wine">
      {"{{"}
      {children}
      {"}}"}
    </span>
  );
}
