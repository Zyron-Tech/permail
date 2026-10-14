"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { saveAudienceSheet } from "@/lib/actions";
import { isValidEmail, toFieldKey } from "@/lib/merge";
import { parseDelimited } from "@/lib/csv";

export type EditorRow = { key: string; email: string; data: Record<string, string> };

let counter = 0;
const nextKey = () => `r${++counter}_${Date.now().toString(36)}`;

export function SheetEditor({
  audienceId,
  initialFields,
  initialRows,
}: {
  audienceId: string;
  initialFields: string[];
  initialRows: EditorRow[];
}) {
  const [fields, setFields] = useState<string[]>(initialFields);
  const [rows, setRows] = useState<EditorRow[]>(
    initialRows.length ? initialRows : [blankRow()],
  );
  const [dirty, setDirty] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function blankRow(): EditorRow {
    return { key: nextKey(), email: "", data: {} };
  }

  function mutate(fn: () => void) {
    fn();
    setDirty(true);
    setMessage(null);
  }

  // --- column ops ----------------------------------------------------------

  function addField() {
    const label = window.prompt("Column name (e.g. company, city, last_order)");
    if (!label) return;
    const key = toFieldKey(label);
    if (!key) return;
    if (key === "email" || fields.includes(key)) {
      setMessage(`"${key}" already exists.`);
      return;
    }
    mutate(() => setFields((current) => [...current, key]));
  }

  function renameField(field: string) {
    const label = window.prompt("Rename column", field);
    if (!label) return;
    const key = toFieldKey(label);
    if (!key || key === field) return;
    if (key === "email" || fields.includes(key)) {
      setMessage(`"${key}" already exists.`);
      return;
    }
    mutate(() => {
      setFields((current) => current.map((f) => (f === field ? key : f)));
      setRows((current) =>
        current.map((row) => {
          const { [field]: value, ...rest } = row.data;
          return { ...row, data: value === undefined ? rest : { ...rest, [key]: value } };
        }),
      );
    });
  }

  function removeField(field: string) {
    if (!window.confirm(`Remove the "${field}" column and its values?`)) return;
    mutate(() => {
      setFields((current) => current.filter((f) => f !== field));
      setRows((current) =>
        current.map((row) => {
          const { [field]: _drop, ...rest } = row.data;
          return { ...row, data: rest };
        }),
      );
    });
  }

  // --- row ops -------------------------------------------------------------

  function setCell(key: string, field: string, value: string) {
    mutate(() =>
      setRows((current) =>
        current.map((row) =>
          row.key !== key
            ? row
            : field === "email"
              ? { ...row, email: value }
              : { ...row, data: { ...row.data, [field]: value } },
        ),
      ),
    );
  }

  function addRow() {
    mutate(() => setRows((current) => [...current, blankRow()]));
  }

  function removeRow(key: string) {
    mutate(() =>
      setRows((current) => {
        const next = current.filter((row) => row.key !== key);
        return next.length ? next : [blankRow()];
      }),
    );
  }

  /** Pasting a block of spreadsheet cells into a cell fills the grid from there. */
  function handleCellPaste(
    event: React.ClipboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: string,
  ) {
    const text = event.clipboardData.getData("text/plain");
    if (!/[\t\n]/.test(text)) return;
    event.preventDefault();

    const grid = parseDelimited(text);
    if (!grid.length) return;

    const columnOrder = ["email", ...fields];
    const startColumn = columnOrder.indexOf(field);

    mutate(() =>
      setRows((current) => {
        const next = [...current];
        grid.forEach((cells, r) => {
          const target = rowIndex + r;
          while (next.length <= target) next.push(blankRow());
          const row = { ...next[target], data: { ...next[target].data } };
          cells.forEach((cell, c) => {
            const column = columnOrder[startColumn + c];
            if (!column) return;
            if (column === "email") row.email = cell;
            else row.data[column] = cell;
          });
          next[target] = row;
        });
        return next;
      }),
    );
  }

  // --- import --------------------------------------------------------------

  function applyImport(text: string, hasHeader: boolean, replace: boolean) {
    const grid = parseDelimited(text);
    if (!grid.length) {
      setMessage("Nothing to import — the paste looked empty.");
      return;
    }

    let headers: string[];
    let bodyRows: string[][];

    if (hasHeader) {
      headers = grid[0].map((cell) => toFieldKey(cell) || "column");
      bodyRows = grid.slice(1);
    } else {
      const width = Math.max(...grid.map((cells) => cells.length));
      headers = Array.from({ length: width }, (_, i) => (i === 0 ? "email" : `column_${i}`));
      bodyRows = grid;
    }

    // Whichever column looks like addresses becomes `email`.
    let emailIndex = headers.findIndex((header) => header.includes("email"));
    if (emailIndex === -1) {
      emailIndex = headers.findIndex((_, i) => bodyRows.some((cells) => isValidEmail(cells[i] ?? "")));
    }
    if (emailIndex === -1) emailIndex = 0;

    const newFields = headers
      .map((header, i) => (i === emailIndex ? null : header))
      .filter((header): header is string => Boolean(header) && header !== "email");

    const imported: EditorRow[] = bodyRows.map((cells) => {
      const data: Record<string, string> = {};
      headers.forEach((header, i) => {
        if (i === emailIndex || header === "email") return;
        const value = (cells[i] ?? "").trim();
        if (value) data[header] = value;
      });
      return { key: nextKey(), email: (cells[emailIndex] ?? "").trim(), data };
    });

    mutate(() => {
      setFields((current) => [...new Set(replace ? newFields : [...current, ...newFields])]);
      setRows((current) => {
        const kept = replace ? [] : current.filter((row) => row.email.trim());
        return [...kept, ...imported];
      });
    });

    setImportOpen(false);
    setMessage(`Imported ${imported.length} ${imported.length === 1 ? "row" : "rows"}.`);
  }

  // --- save ----------------------------------------------------------------

  const stats = useMemo(() => {
    const filled = rows.filter((row) => row.email.trim());
    const invalid = filled.filter((row) => !isValidEmail(row.email));
    const seen = new Set<string>();
    const duplicates = filled.filter((row) => {
      const email = row.email.trim().toLowerCase();
      if (seen.has(email)) return true;
      seen.add(email);
      return false;
    });
    return { total: filled.length, invalid, duplicates };
  }, [rows]);

  function save() {
    startTransition(async () => {
      const result = await saveAudienceSheet(
        audienceId,
        fields,
        rows.map((row) => ({ email: row.email, data: row.data })),
      );
      if (result.ok) {
        setDirty(false);
        setMessage(`Saved ${result.count} ${result.count === 1 ? "recipient" : "recipients"}.`);
      } else {
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="pb-24">
      {/* toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button className="btn btn-ghost btn-sm" onClick={() => setImportOpen(true)}>
          Paste / import
        </button>
        <button className="btn btn-ghost btn-sm" onClick={addField}>
          + Column
        </button>
        <button className="btn btn-ghost btn-sm" onClick={addRow}>
          + Row
        </button>
        <span className="ml-auto font-mono text-xs text-ash">
          {stats.total} {stats.total === 1 ? "recipient" : "recipients"}
        </span>
      </div>

      {/* merge tags available */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {["email", ...fields].map((field) => (
          <span key={field} className="tag">{`{{${field}}}`}</span>
        ))}
      </div>

      {message ? (
        <p className="card mb-4 border-wine/25 bg-wine-pale px-3.5 py-2.5 text-sm text-wine">{message}</p>
      ) : null}

      {(stats.invalid.length > 0 || stats.duplicates.length > 0) && (
        <p className="card mb-4 border-sun bg-sun-soft px-3.5 py-2.5 text-sm text-pine">
          {[
            stats.invalid.length > 0 &&
              `${stats.invalid.length} address${stats.invalid.length === 1 ? " doesn't" : "es don't"} look valid`,
            stats.duplicates.length > 0 &&
              `${stats.duplicates.length} duplicate${stats.duplicates.length === 1 ? "" : "s"}`,
          ]
            .filter(Boolean)
            .join(" · ")}
          . Invalid addresses are underlined; duplicates are skipped at send time.
        </p>
      )}

      {/* ---- desktop grid ---- */}
      <div className="card hidden overflow-hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-paper">
                <th className="w-9" />
                <th className="min-w-[220px] px-3 py-2 text-left font-mono text-xs font-medium text-pine">
                  email
                </th>
                {fields.map((field) => (
                  <th key={field} className="min-w-[160px] px-3 py-2 text-left">
                    <span className="flex items-center gap-1.5">
                      <button
                        className="font-mono text-xs font-medium text-pine hover:underline"
                        onClick={() => renameField(field)}
                        title="Rename column"
                      >
                        {field}
                      </button>
                      <button
                        className="text-ash transition-colors hover:text-pine"
                        onClick={() => removeField(field)}
                        title="Remove column"
                        aria-label={`Remove ${field}`}
                      >
                        ×
                      </button>
                    </span>
                  </th>
                ))}
                <th className="w-10 px-2">
                  <button className="text-lg text-ash hover:text-pine" onClick={addField} title="Add column">
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => {
                const bad = row.email.trim() !== "" && !isValidEmail(row.email);
                return (
                  <tr key={row.key} className="border-b border-line last:border-0">
                    <td className="px-2 text-center font-mono text-[11px] text-ash">{rowIndex + 1}</td>
                    <td className="p-0">
                      <input
                        value={row.email}
                        onChange={(e) => setCell(row.key, "email", e.target.value)}
                        onPaste={(e) => handleCellPaste(e, rowIndex, "email")}
                        placeholder="name@company.com"
                        inputMode="email"
                        className={`w-full bg-transparent px-3 py-2.5 text-sm outline-none focus:bg-sun-soft ${
                          bad ? "text-wine underline decoration-wavy" : ""
                        }`}
                      />
                    </td>
                    {fields.map((field) => (
                      <td key={field} className="p-0">
                        <input
                          value={row.data[field] ?? ""}
                          onChange={(e) => setCell(row.key, field, e.target.value)}
                          onPaste={(e) => handleCellPaste(e, rowIndex, field)}
                          className="w-full bg-transparent px-3 py-2.5 text-sm outline-none focus:bg-sun-soft"
                        />
                      </td>
                    ))}
                    <td className="px-2 text-center">
                      <button
                        className="text-ash transition-colors hover:text-pine"
                        onClick={() => removeRow(row.key)}
                        aria-label={`Remove row ${rowIndex + 1}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          className="w-full border-t border-line py-2.5 text-sm font-medium text-ash transition-colors hover:bg-paper hover:text-pine"
          onClick={addRow}
        >
          + Add row
        </button>
      </div>

      {/* ---- mobile cards ---- */}
      <div className="space-y-3 sm:hidden">
        {rows.map((row, rowIndex) => {
          const bad = row.email.trim() !== "" && !isValidEmail(row.email);
          return (
            <div key={row.key} className="card p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-ash">#{rowIndex + 1}</span>
                <button
                  className="text-sm text-ash"
                  onClick={() => removeRow(row.key)}
                  aria-label={`Remove recipient ${rowIndex + 1}`}
                >
                  Remove
                </button>
              </div>

              <label className="label">email</label>
              <input
                value={row.email}
                onChange={(e) => setCell(row.key, "email", e.target.value)}
                placeholder="name@company.com"
                inputMode="email"
                autoCapitalize="off"
                className={`field mb-3 ${bad ? "border-wine text-wine" : ""}`}
              />

              {fields.map((field) => (
                <div key={field} className="mb-3 last:mb-0">
                  <label className="label">{field}</label>
                  <input
                    value={row.data[field] ?? ""}
                    onChange={(e) => setCell(row.key, field, e.target.value)}
                    className="field"
                  />
                </div>
              ))}
            </div>
          );
        })}

        <button className="btn btn-ghost w-full" onClick={addRow}>
          + Add recipient
        </button>
      </div>

      {/* sticky save bar */}
      <div
        className="fixed inset-x-0 bottom-16 z-20 border-t border-line bg-card/95 backdrop-blur sm:bottom-0"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
          <span className="font-mono text-xs text-ash">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button className="btn btn-primary btn-sm ml-auto" onClick={save} disabled={pending || !dirty}>
            {pending ? "Saving…" : "Save audience"}
          </button>
        </div>
      </div>

      {importOpen ? <ImportDialog onClose={() => setImportOpen(false)} onApply={applyImport} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ImportDialog({
  onClose,
  onApply,
}: {
  onClose: () => void;
  onApply: (text: string, hasHeader: boolean, replace: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [hasHeader, setHasHeader] = useState(true);
  const [replace, setReplace] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);

  async function readFile(file: File) {
    setText(await file.text());
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-5">
      <div className="card w-full max-w-2xl rounded-b-none sm:rounded-b-[14px]">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="font-display text-lg font-semibold text-ink">Import recipients</h2>
          <button className="text-xl leading-none text-ash hover:text-ink" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3 text-sm leading-relaxed text-ash">
            Paste straight from a spreadsheet, or drop in a CSV. Every column you bring becomes a
            merge tag you can use in the message.
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder={"email\tfirst_name\tcompany\namara@kite.studio\tAmara\tKite Studio"}
            className="field font-mono text-[13px]"
          />

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
              First row is a header
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
              Replace what&apos;s here
            </label>

            <button className="btn btn-ghost btn-sm ml-auto" onClick={() => fileInput.current?.click()}>
              Choose CSV
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.tsv,.txt,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) readFile(file);
              }}
            />
          </div>
        </div>

        <div
          className="flex justify-end gap-2 border-t border-line px-4 py-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onApply(text, hasHeader, replace)}
            disabled={!text.trim()}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
