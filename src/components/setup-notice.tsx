import { SUPABASE_VARS, SENDING_VARS, missingVars } from "@/lib/env";

/**
 * Shown instead of the app when environment variables are missing — a first run
 * should explain itself rather than throw.
 */
export function SetupNotice() {
  const missingCore = missingVars(SUPABASE_VARS);
  const missingSending = missingVars(SENDING_VARS);

  return (
    <main className="mx-auto min-h-dvh max-w-2xl px-5 py-16">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-wine font-display text-sm font-bold text-sun">
          P
        </span>
        <span className="font-display text-lg font-bold tracking-tight text-ink">permail</span>
      </div>

      <p className="eyebrow mb-4 text-wine">[00] &nbsp; One-time setup</p>
      <h1 className="text-4xl font-bold leading-tight text-ink">
        Permail needs its keys before it can run.
      </h1>

      <div className="card mt-8 p-5">
        <p className="label">Step 1 — create your env file</p>
        <pre className="overflow-x-auto rounded-lg border border-line bg-paper px-3.5 py-3 font-mono text-[13px] text-ink">
          cp .env.example .env.local
        </pre>

        <p className="label mt-6">Step 2 — fill in these values</p>
        <ul className="space-y-2">
          {[...SUPABASE_VARS, ...SENDING_VARS].map((name) => {
            const missing = [...missingCore, ...missingSending].includes(name);
            return (
              <li key={name} className="flex items-center gap-2.5">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${missing ? "bg-wine" : "bg-sun"}`}
                />
                <code className="font-mono text-[13px] text-ink">{name}</code>
                <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-ash">
                  {missing ? "missing" : "set"}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-ash">
          The Supabase values come from <strong className="text-ink">Project Settings → API</strong>.
          The Google pair is the OAuth client you registered for the Gmail API — Permail uses it
          server-side to refresh access tokens while a campaign sends.
        </p>

        <p className="label mt-6">Step 3 — create the tables</p>
        <p className="text-sm leading-relaxed text-ash">
          Run <code className="font-mono text-ink">supabase/schema.sql</code> in the Supabase SQL
          editor, then restart <code className="font-mono text-ink">npm run dev</code>.
        </p>
      </div>

      <p className="mt-6 text-sm text-ash">
        Full walkthrough, including the Google Cloud consent screen, is in{" "}
        <code className="font-mono text-ink">README.md</code>.
      </p>
    </main>
  );
}
