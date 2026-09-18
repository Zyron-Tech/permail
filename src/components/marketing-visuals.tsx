/**
 * Supporting product imagery for the public site. All of it is markup built
 * from the design tokens rather than bitmaps: it stays sharp on any screen,
 * costs no download, and can never drift out of date with the real UI.
 *
 * These are the *product* visuals. Space reserved for photography lives in
 * `image-slot.tsx`, and the shot list in `public/images/README.md`.
 */

const SHEET = [
  ["amara@kite.studio", "Amara", "Kite Studio", "Lagos"],
  ["tobias@northwind.co", "Tobias", "Northwind", "Berlin"],
  ["dana@fold.co", "Dana", "Fold & Co", "Lisbon"],
  ["wei@brightlab.tw", "Wei", "Bright Lab", "Taipei"],
  ["ines@atelier.fr", "Inès", "Atelier Sud", "Marseille"],
  ["rafa@casacruz.mx", "Rafa", "Casa Cruz", "Mexico City"],
];

const FRAME =
  "overflow-hidden rounded-[6px] border border-hair bg-snow " +
  "shadow-[0_1px_2px_rgba(18,17,16,0.04),0_24px_48px_-32px_rgba(18,17,16,0.22)]";

/** The audience grid — shows that the columns are arbitrary and yours. */
export function SheetShot() {
  return (
    <div className={FRAME}>
      <div className="flex items-baseline gap-3 border-b border-hair px-5 py-3.5">
        <span className="text-[13px] font-medium text-graphite">Studio list</span>
        <span className="font-mono text-[10px] text-stone">6 recipients</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
          + column
        </span>
      </div>

      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[460px] border-collapse text-left">
          <thead>
            <tr className="border-b border-hair">
              {["email", "first_name", "company", "city"].map((head, i) => (
                <th
                  key={head}
                  className={`whitespace-nowrap px-5 py-2.5 font-mono text-[10.5px] font-normal uppercase tracking-[0.12em] ${
                    i === 0 ? "text-stone" : "text-wine"
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHEET.map((row) => (
              <tr key={row[0]} className="border-b border-hair last:border-0">
                {row.map((cell, i) => (
                  <td
                    key={i}
                    className={`whitespace-nowrap px-5 py-3 text-[12.5px] ${
                      i === 0 ? "text-stone" : "text-graphite"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hair bg-bone px-5 py-3.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone">
          available tags
        </span>
        {["first_name", "company", "city"].map((field) => (
          <span key={field} className="font-mono text-[11px] text-wine">{`{{${field}}}`}</span>
        ))}
      </div>
    </div>
  );
}

/** What the recipient sees: an ordinary one-to-one email, not a blast. */
export function InboxShot() {
  return (
    <div className={FRAME}>
      <div className="flex items-baseline border-b border-hair px-5 py-3.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone">Inbox</span>
        <span className="ml-auto font-mono text-[10px] text-stone">9:14</span>
      </div>

      <div className="p-5 sm:p-7">
        <p className="text-[17px] leading-snug text-graphite">A note about Kite Studio</p>

        <div className="mt-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-fog font-mono text-[12px] text-slate">
            SA
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] text-graphite">
              Sam Adeyemi <span className="text-stone">&lt;sam@studio.co&gt;</span>
            </span>
            <span className="block text-[11.5px] text-stone">to me</span>
          </span>
        </div>

        <div className="mt-6 space-y-3 text-[13.5px] leading-[1.8] text-slate">
          <p>Hi Amara,</p>
          <p>
            I came across Kite Studio while reading about the studio scene in Lagos and wanted to
            say hello.
          </p>
          <p>— Sam</p>
        </div>

        <div className="mt-7 flex items-center gap-2 border-t border-hair pt-5">
          {["Reply", "Forward"].map((action) => (
            <span
              key={action}
              className="rounded-[3px] border border-hair px-3 py-1.5 text-[12px] text-slate"
            >
              {action}
            </span>
          ))}
          <span className="ml-auto font-mono text-[10px] text-stone">no footer appended</span>
        </div>
      </div>
    </div>
  );
}

/** The app on a handset — the mobile-first claim, shown rather than told. */
export function PhoneShot() {
  return (
    <div className="mx-auto w-[236px] rounded-[38px] border border-hair bg-snow p-2.5 shadow-[0_1px_2px_rgba(18,17,16,0.04),0_32px_64px_-36px_rgba(18,17,16,0.28)]">
      <div className="relative overflow-hidden rounded-[28px] border border-hair bg-bone">
        <div className="absolute left-1/2 top-2.5 h-1 w-14 -translate-x-1/2 rounded-full bg-hair" />

        <div className="px-4 pb-4 pt-9">
          <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-stone">
            Good evening
          </p>
          <p className="display mt-1.5 text-[19px]">Hello, Amara.</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              ["1,204", "emails personalised"],
              ["18", "campaigns sent"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[4px] border border-hair bg-snow p-2.5">
                <p className="font-mono text-[15px] leading-none tracking-tight text-graphite">
                  {value}
                </p>
                <p className="mt-1.5 text-[8.5px] leading-tight text-stone">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 space-y-2">
            {[
              ["Spring outreach", "248 of 248 delivered"],
              ["Studio follow-up", "96 of 96 delivered"],
            ].map(([name, meta]) => (
              <div key={name} className="rounded-[4px] border border-hair bg-snow p-2.5">
                <p className="text-[9.5px] leading-none text-graphite">{name}</p>
                <p className="mt-1.5 font-mono text-[8px] leading-none text-stone">{meta}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-t border-hair bg-snow">
          {["Home", "Send", "People", "Guide"].map((item, i) => (
            <span
              key={item}
              className={`flex-1 py-2.5 text-center font-mono text-[7.5px] uppercase tracking-[0.12em] ${
                i === 0 ? "text-wine" : "text-stone"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
