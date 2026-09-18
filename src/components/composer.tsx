"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCampaign } from "@/lib/actions";
import { render, unknownTokens, rowsMissingValues, isValidEmail, type Row } from "@/lib/merge";
import { textToHtml } from "@/lib/format";
import type { Campaign } from "@/lib/types";

export type AudienceOption = { id: string; name: string; fields: string[] };
export type PreviewContact = { email: string; data: Record<string, string> };

export function Composer({
  campaign,
  audiences,
  contacts,
  fromEmail,
  canSend,
}: {
  campaign: Campaign;
  audiences: AudienceOption[];
  contacts: PreviewContact[];
  fromEmail: string;
  canSend: boolean;
}) {
  const router = useRouter();

  const [name, setName] = useState(campaign.name);
  const [subject, setSubject] = useState(campaign.subject);
  const [body, setBody] = useState(campaign.body);
  const [audienceId, setAudienceId] = useState(campaign.audience_id ?? "");
  const [fromName, setFromName] = useState(campaign.from_name ?? "");
  const [replyTo, setReplyTo] = useState(campaign.reply_to ?? "");

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<"subject" | "body">("body");
  const firstRender = useRef(true);

  const audience = audiences.find((a) => a.id === audienceId) ?? null;
  const fields = useMemo(() => ["email", ...(audience?.fields ?? [])], [audience]);

  // --- autosave ------------------------------------------------------------
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("saving");
    const timer = setTimeout(async () => {
      const result = await saveCampaign(campaign.id, {
        name: name.trim() || "Untitled campaign",
        subject,
        body,
        audience_id: audienceId || null,
        from_name: fromName.trim() || null,
        reply_to: replyTo.trim() || null,
      });
      setSaveState(result.ok ? "saved" : "error");
    }, 700);

    return () => clearTimeout(timer);
  }, [campaign.id, name, subject, body, audienceId, fromName, replyTo]);

  // --- previews ------------------------------------------------------------
  const rows: Row[] = useMemo(
    () => contacts.map((contact) => ({ ...contact.data, email: contact.email })),
    [contacts],
  );

  const safeIndex = rows.length ? Math.min(previewIndex, rows.length - 1) : 0;
  const previewRow = rows[safeIndex];

  const previewSubject = previewRow ? render(subject, previewRow) : subject;
  const previewHtml = useMemo(
    () => textToHtml(previewRow ? render(body, previewRow) : body),
    [body, previewRow],
  );

  // --- checks --------------------------------------------------------------
  const checks = useMemo(() => {
    const unknown = unknownTokens([subject, body], fields);
    const blanks = rowsMissingValues([subject, body], rows);
    const invalid = contacts.filter((contact) => !isValidEmail(contact.email));
    return { unknown, blanks, invalid };
  }, [subject, body, fields, rows, contacts]);

  const blockers: string[] = [];
  if (!canSend) blockers.push("Gmail permission is missing — reconnect in Settings.");
  if (!audienceId) blockers.push("Pick an audience.");
  else if (contacts.length === 0) blockers.push("That audience has no recipients yet.");
  if (!subject.trim()) blockers.push("Add a subject.");
  if (!body.trim()) blockers.push("Write a message.");
  if (checks.unknown.length) blockers.push(`No column for ${checks.unknown.map((t) => `{{${t}}}`).join(", ")}.`);

  // --- token insertion -----------------------------------------------------
  function insertToken(field: string) {
    const token = `{{${field}}}`;

    if (lastFocused.current === "subject") {
      const input = subjectRef.current;
      if (!input) return;
      const start = input.selectionStart ?? subject.length;
      const end = input.selectionEnd ?? start;
      const next = subject.slice(0, start) + token + subject.slice(end);
      setSubject(next);
      queueMicrotask(() => {
        input.focus();
        input.setSelectionRange(start + token.length, start + token.length);
      });
      return;
    }

    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? body.length;
    const end = textarea.selectionEnd ?? start;
    const next = body.slice(0, start) + token + body.slice(end);
    setBody(next);
    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <div className="pb-28">
      {/* title row */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Untitled campaign"
        spellCheck={false}
        className="-ml-2 mb-1 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-display text-3xl font-bold tracking-tight text-ink outline-none transition-colors hover:border-line focus:border-wine focus:bg-card sm:text-4xl"
      />
      <p className="mb-6 pl-0.5 font-mono text-xs text-ash">
        {saveState === "saving" ? "saving…" : saveState === "error" ? "save failed" : "draft · saved"}
      </p>

      {/* audience picker */}
      <div className="card mb-4 p-4">
        <label className="label" htmlFor="audience">
          Audience
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            id="audience"
            value={audienceId}
            onChange={(e) => {
              const value = e.target.value;
              setAudienceId(value);
              setPreviewIndex(0);
              // Persist first, then refresh — otherwise the server sends back
              // the previous audience's contacts.
              startTransition(async () => {
                await saveCampaign(campaign.id, { audience_id: value || null });
                router.refresh();
              });
            }}
            className="field sm:max-w-xs"
          >
            <option value="">Choose a list…</option>
            {audiences.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>

          <p className="font-mono text-xs text-ash">
            {audienceId ? `${contacts.length} recipients` : "no list selected"}
          </p>
        </div>

        {audience ? (
          <div className="mt-3.5">
            <p className="label">Tap to insert</p>
            <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 no-scrollbar">
              {fields.map((field) => (
                <button key={field} className="tag shrink-0" onClick={() => insertToken(field)}>
                  {`{{${field}}}`}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* mobile tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-line bg-card p-1 lg:hidden">
        {(["write", "preview"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
              tab === value ? "bg-wine text-sun" : "text-ash"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---- write ---- */}
        <div className={`${tab === "write" ? "block" : "hidden"} lg:block`}>
          <div className="card p-4">
            <label className="label" htmlFor="subject">
              Subject
            </label>
            <input
              id="subject"
              ref={subjectRef}
              value={subject}
              onFocus={() => (lastFocused.current = "subject")}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A quick note about {{company}}"
              className="field mb-4"
            />

            <label className="label" htmlFor="body">
              Message
            </label>
            <textarea
              id="body"
              ref={bodyRef}
              value={body}
              onFocus={() => (lastFocused.current = "body")}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              placeholder={"Hi {{first_name}},\n\nI came across {{company}} and…"}
              className="field resize-y leading-relaxed"
            />

            <p className="mt-2 text-xs leading-relaxed text-ash">
              Plain text with a light touch: <code className="font-mono">**bold**</code>,{" "}
              <code className="font-mono">*italic*</code>,{" "}
              <code className="font-mono">[label](https://link)</code>, and{" "}
              <code className="font-mono">- bullets</code>. Use{" "}
              <code className="font-mono">{"{{field|fallback}}"}</code> to cover blank cells.
            </p>
          </div>

          <details className="card mt-4 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Sender details
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="from-name">
                  From name
                </label>
                <input
                  id="from-name"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Your name"
                  className="field"
                />
              </div>
              <div>
                <label className="label" htmlFor="reply-to">
                  Reply-to
                </label>
                <input
                  id="reply-to"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder={fromEmail}
                  className="field"
                />
              </div>
            </div>
            <p className="mt-3 font-mono text-xs text-ash">sends from {fromEmail}</p>
          </details>
        </div>

        {/* ---- preview ---- */}
        <div className={`${tab === "preview" ? "block" : "hidden"} lg:block`}>
          <div className="card overflow-hidden lg:sticky lg:top-20">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <p className="eyebrow text-ash">Preview</p>
              {rows.length > 1 ? (
                <div className="ml-auto flex items-center gap-1">
                  <button
                    className="btn btn-ghost btn-sm h-7 w-7 !p-0"
                    onClick={() => setPreviewIndex((i) => Math.max(0, i - 1))}
                    disabled={safeIndex === 0}
                    aria-label="Previous recipient"
                  >
                    ‹
                  </button>
                  <span className="font-mono text-xs text-ash">
                    {safeIndex + 1}/{rows.length}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm h-7 w-7 !p-0"
                    onClick={() => setPreviewIndex((i) => Math.min(rows.length - 1, i + 1))}
                    disabled={safeIndex >= rows.length - 1}
                    aria-label="Next recipient"
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>

            <div className="border-b border-line bg-paper px-4 py-3">
              <p className="truncate font-mono text-xs text-ash">
                to {previewRow?.email ?? "—"}
              </p>
              <p className="mt-1 font-display text-base font-semibold leading-snug text-ink">
                {previewSubject || "No subject yet"}
              </p>
            </div>

            <div
              className="max-h-[60vh] overflow-y-auto px-4 py-4 text-[15px] leading-relaxed text-ink"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>

          {checks.blanks.length > 0 ? (
            <p className="card mt-4 border-sun bg-sun-soft px-3.5 py-2.5 text-sm text-wine">
              {checks.blanks.length} {checks.blanks.length === 1 ? "recipient is" : "recipients are"}{" "}
              missing a value — those tags will render empty. Add a fallback like{" "}
              <code className="font-mono">{"{{company|your team}}"}</code>.
            </p>
          ) : null}
        </div>
      </div>

      {/* send bar */}
      <div
        className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-card/95 backdrop-blur sm:bottom-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          <p className="min-w-0 flex-1 truncate text-xs text-ash">
            {blockers.length ? blockers[0] : `Ready — ${contacts.length} personalised emails`}
          </p>
          <button
            className="btn btn-primary btn-sm shrink-0"
            disabled={blockers.length > 0}
            onClick={() => setConfirmOpen(true)}
          >
            Send campaign
          </button>
        </div>
      </div>

      {confirmOpen ? (
        <SendDialog
          campaignId={campaign.id}
          count={contacts.length}
          invalid={checks.invalid.length}
          blanks={checks.blanks.length}
          onClose={() => setConfirmOpen(false)}
          onDone={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

function SendDialog({
  campaignId,
  count,
  invalid,
  blanks,
  onClose,
  onDone,
}: {
  campaignId: string;
  count: number;
  invalid: number;
  blanks: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState<{ sent: number; failed: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function start() {
    setRunning(true);
    setError(null);

    try {
      // The endpoint sends one batch per call, so we drive it until it drains.
      for (;;) {
        const response = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.error ?? "Sending failed.");
          break;
        }

        setProgress({ sent: payload.sent, failed: payload.failed, total: payload.total });
        if (payload.remaining === 0) break;
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sending failed.");
    } finally {
      setRunning(false);
      onDone();
    }
  }

  const done = progress !== null && !running && !error;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-5">
      <div className="card w-full max-w-md rounded-b-none p-5 sm:rounded-b-[14px]">
        {!progress && !error ? (
          <>
            <h2 className="font-display text-xl font-bold text-ink">
              Send to {count} {count === 1 ? "person" : "people"}?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ash">
              Each one gets their own separate email from your Gmail account. This can&apos;t be
              undone.
            </p>

            {invalid > 0 || blanks > 0 ? (
              <ul className="mt-4 space-y-1.5 text-sm text-wine">
                {invalid > 0 ? <li>· {invalid} address{invalid === 1 ? "" : "es"} look invalid and will fail.</li> : null}
                {blanks > 0 ? <li>· {blanks} recipient{blanks === 1 ? "" : "s"} will have an empty merge tag.</li> : null}
              </ul>
            ) : null}

            <div className="mt-6 flex gap-2">
              <button className="btn btn-ghost flex-1" onClick={onClose}>
                Back
              </button>
              <button className="btn btn-primary flex-1" onClick={start}>
                Send now
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-ink">
              {error ? "Sending stopped" : done ? "Done" : "Sending…"}
            </h2>

            {progress ? (
              <>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full bg-wine transition-all duration-300"
                    style={{
                      width: `${Math.round(((progress.sent + progress.failed) / Math.max(1, progress.total)) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-3 font-mono text-sm text-ash">
                  {progress.sent} sent
                  {progress.failed > 0 ? ` · ${progress.failed} failed` : ""} of {progress.total}
                </p>
              </>
            ) : null}

            {error ? <p className="mt-3 text-sm text-wine">{error}</p> : null}

            <button
              className="btn btn-primary mt-6 w-full"
              onClick={onClose}
              disabled={running}
            >
              {running ? "Working…" : "Close"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
