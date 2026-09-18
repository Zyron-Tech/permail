import Link from "next/link";
import { milestone, formatCount, plural, type Step } from "@/lib/progress";

/** A ring instead of a bar — it reads as "a thing to complete", not a loading state. */
export function Ring({ done, total, size = 56 }: { done: number; total: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = total > 0 ? (done / total) * circumference : 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-wine)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink font-mono"
        style={{ fontSize: size * 0.28, fontWeight: 500 }}
      >
        {done}/{total}
      </text>
    </svg>
  );
}

const HEADINGS = [
  "Let's get you sending",
  "Good start",
  "Halfway there",
  "One step to go",
  "All set",
];

export function SetupPath({ steps }: { steps: Step[] }) {
  const done = steps.filter((step) => step.done).length;
  const current = steps.find((step) => !step.done);

  return (
    <section className="card edge-sun mb-6 overflow-hidden">
      <div className="flex items-center gap-4 border-b border-line px-4 py-4 sm:px-5">
        <Ring done={done} total={steps.length} />
        <div className="min-w-0">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
            {HEADINGS[done] ?? HEADINGS[0]}
          </h2>
          <p className="mt-0.5 text-sm text-ash">
            {steps.length - done} {plural(steps.length - done, "step")} left — about five minutes.
          </p>
        </div>
      </div>

      <ol>
        {steps.map((step, index) => {
          const isCurrent = step.key === current?.key;

          return (
            <li
              key={step.key}
              className={`flex items-start gap-3.5 border-b border-line px-4 py-4 last:border-0 sm:px-5 ${
                isCurrent ? "bg-sun-pale" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${
                  step.done
                    ? "border-moss bg-moss text-white"
                    : isCurrent
                      ? "border-wine bg-wine text-sun"
                      : "border-line bg-card text-mist"
                }`}
              >
                {step.done ? <Check /> : index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold ${step.done ? "text-mist line-through decoration-1" : "text-ink"}`}
                >
                  {step.title}
                </p>
                {!step.done ? (
                  <p className="mt-0.5 text-sm leading-relaxed text-ash">{step.body}</p>
                ) : null}

                {isCurrent ? (
                  <Link href={step.href} className="btn btn-primary btn-sm mt-3">
                    {step.cta}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function MilestoneBar({ totalSent }: { totalSent: number }) {
  const { next, progress } = milestone(totalSent);

  if (next === null) {
    return (
      <p className="font-mono text-xs text-ash">
        {formatCount(totalSent)} personalised emails sent. Every milestone cleared.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-mono text-xs text-ash">
          {formatCount(next - totalSent)} to go
        </p>
        <p className="font-mono text-xs text-ash">next mark · {formatCount(next)}</p>
      </div>
      <div className="meter">
        <span style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function StatTile({
  value,
  label,
  tone = "plain",
}: {
  value: string;
  label: string;
  tone?: "plain" | "sun" | "wine" | "moss";
}) {
  const tones = {
    plain: "bg-card border-line text-ink",
    sun: "bg-sun border-wine text-wine",
    wine: "bg-wine border-wine text-sun",
    moss: "bg-moss-pale border-moss-soft text-moss",
  } as const;

  return (
    <div className={`rounded-[16px] border p-4 ${tones[tone]}`}>
      <p className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1 text-[13px] leading-snug opacity-80">{label}</p>
    </div>
  );
}

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
      <path d="m4 12.5 5.5 5.5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
