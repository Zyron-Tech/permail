import Link from "next/link";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Guide — Permail" };

const SECTIONS = [
  { id: "idea", label: "The idea" },
  { id: "tags", label: "Merge tags" },
  { id: "audiences", label: "Audiences" },
  { id: "writing", label: "Writing" },
  { id: "sending", label: "Sending" },
  { id: "landing", label: "Getting read" },
  { id: "trouble", label: "When something breaks" },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader eyebrow="Guide" title="How Permail works" />

      <p className="mb-6 max-w-xl text-lg leading-relaxed text-ash">
        Five minutes of reading covers everything. Nothing here is required to get started —
        the app will keep you right — but it&apos;s all worth knowing before a big send.
      </p>

      {/* jump bar — scrolls sideways on a phone */}
      <nav className="-mx-4 mb-8 flex gap-1.5 overflow-x-auto px-4 pb-1 no-scrollbar">
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="shrink-0 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium text-ash transition-colors hover:border-wine hover:text-wine"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="max-w-2xl space-y-10">
        <Section id="idea" number="01" title="One draft, many letters">
          <p>
            Most bulk email looks like bulk email. Permail works the other way round: you write a
            single message with blanks in it, and every recipient gets their own copy with their
            own details filled in. Each one is a separate Gmail message from your own account —
            no BCC pile, no shared thread, no unsubscribe footer bolted on by a platform.
          </p>
          <p>
            The whole flow is three things: an <strong>audience</strong> (who, plus what you know
            about them), a <strong>campaign</strong> (what you&apos;re saying), and the send.
          </p>
        </Section>

        <Section id="tags" number="02" title="Merge tags">
          <p>
            A merge tag is a column name in double braces. When the message goes out, the tag is
            replaced with that person&apos;s value.
          </p>

          <Example
            rows={[
              ["Hi {{first_name}},", "Hi Amara,"],
              ["Loved the {{city}} shop.", "Loved the Lagos shop."],
            ]}
          />

          <p>
            There is no fixed list of tags and no limit on how many you use. Whatever columns you
            add to an audience become available — <code>{"{{company}}"}</code>,{" "}
            <code>{"{{last_order}}"}</code>, <code>{"{{the_thing_i_liked}}"}</code>. Add ten if
            the message needs ten.
          </p>

          <Callout title="Always give blanks a fallback">
            <p>
              If a cell is empty, a plain tag renders as nothing — &ldquo;Loved the shop.&rdquo;
              Write <code>{"{{city|your city}}"}</code> and the text after the pipe covers anyone
              missing a value. The composer counts how many recipients would render empty before
              you can send.
            </p>
          </Callout>

          <p>
            Tags are forgiving about spelling: <code>{"{{First Name}}"}</code> finds a{" "}
            <code>first_name</code> column. Capitals, spaces, and hyphens are all ignored when
            matching.
          </p>
        </Section>

        <Section id="audiences" number="03" title="Building an audience">
          <p>
            An audience is a sheet. One row per person, an <code>email</code> column, and as many
            other columns as you like. Three ways to fill it:
          </p>
          <ul>
            <li>
              <strong>Paste a block.</strong> Copy cells straight out of Excel, Numbers, or Google
              Sheets and paste into any cell — the grid fills from that point.
            </li>
            <li>
              <strong>Import.</strong> The <em>Paste / import</em> button takes a CSV file or a
              pasted block, reads your header row for column names, and works out which column
              holds the addresses.
            </li>
            <li>
              <strong>Type it.</strong> For a handful of people, just add rows.
            </li>
          </ul>
          <p>
            Invalid addresses get underlined as you type and duplicates are flagged — the same
            address is only ever mailed once per campaign. Nothing is saved until you press{" "}
            <strong>Save audience</strong>.
          </p>
          <p>
            One audience can feed many campaigns, and editing it later never disturbs a campaign
            you&apos;ve already sent: recipients are frozen at the moment you hit send.
          </p>
        </Section>

        <Section id="writing" number="04" title="Writing the message">
          <p>
            The composer is plain text on purpose — it&apos;s what makes these read as personal
            mail rather than a newsletter. A little formatting is understood:
          </p>

          <Example
            rows={[
              ["**bold**", "bold"],
              ["*italic*", "italic"],
              ["[our pricing](https://…)", "a link"],
              ["- a bullet", "• a bullet"],
            ]}
          />

          <p>
            A blank line starts a new paragraph. Tap any tag in the palette to drop it in at your
            cursor — in the subject line too, which is where personalisation does the most work.
          </p>
          <p>
            The preview beside your draft is the real thing, rendered for a real recipient. Page
            through a few with the arrows before sending; it catches awkward grammar that no
            validator can.
          </p>
        </Section>

        <Section id="sending" number="05" title="Sending">
          <p>
            Permail won&apos;t let you send until the basics hold: an audience with people in it,
            a subject, a message, and no tags referring to columns that don&apos;t exist. Then it
            sends in small batches and shows you progress as it goes.
          </p>
          <p>
            You can close the tab. Reopening a campaign that&apos;s still sending picks it up
            exactly where it stopped, and nobody receives a duplicate.
          </p>

          <Callout title="Google sets the daily ceiling, not Permail">
            <p>
              A personal Gmail account sends roughly <strong>500</strong> messages a day; a
              Workspace account about <strong>2,000</strong>. Go past it and the remaining
              recipients come back marked failed with Google&apos;s own message — retry them the
              next day. Large lists are happier split across several days anyway.
            </p>
          </Callout>

          <p>
            Every recipient row shows its own outcome: delivered, or the exact reason it
            didn&apos;t. Failures are almost always a typo in the address.
          </p>
        </Section>

        <Section id="landing" number="06" title="Getting read, not filtered">
          <p>
            Because mail leaves your own Gmail, your normal reputation carries it — which is a
            real advantage, and worth protecting.
          </p>
          <ul>
            <li>
              <strong>Write like a person.</strong> A short message with one specific detail about
              the recipient outperforms anything that reads like marketing.
            </li>
            <li>
              <strong>Personalise the subject.</strong> It&apos;s the line that decides whether the
              rest gets read.
            </li>
            <li>
              <strong>Start small.</strong> Send to twenty, see what comes back, then widen. A
              sudden jump from zero to five hundred is the pattern spam filters watch for.
            </li>
            <li>
              <strong>Only mail people who&apos;d expect it.</strong> Replies and opens help you;
              complaints follow you around for months.
            </li>
          </ul>
        </Section>

        <Section id="trouble" number="07" title="When something breaks">
          <Trouble
            problem="“Google access expired. Reconnect your account.”"
            fix="Your Gmail permission was withdrawn or timed out. Settings → Reconnect Google, and make sure the sending checkbox stays ticked on Google's consent screen."
          />
          <Trouble
            problem="Every recipient failed at once"
            fix="Usually the daily cap, or the Gmail API not being enabled on your Google project. Open any failed row — Google's own wording is right there."
          />
          <Trouble
            problem="A tag printed nothing"
            fix="That row had an empty cell. Give the tag a fallback: {{company|your team}}. The composer warns about this before sending."
          />
          <Trouble
            problem="“No column for {{something}}”"
            fix="The draft references a column the chosen audience doesn't have. Either add the column to the audience, or fix the spelling in the draft."
          />
        </Section>
      </div>

      <div className="card edge-sun mt-10 max-w-2xl p-5 text-center">
        <h2 className="font-display text-xl font-bold tracking-tight text-ink">
          That&apos;s the whole thing.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ash">
          Everything else you&apos;ll pick up by doing it once.
        </p>
        <Link href="/app/campaigns" className="btn btn-primary mt-5">
          Write a campaign
        </Link>
      </div>
    </>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="eyebrow mb-2 text-wine">[{number}]</p>
      <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      <div className="guide-body space-y-4 leading-relaxed text-ash">{children}</div>
    </section>
  );
}

function Example({ rows }: { rows: [string, string][] }) {
  return (
    <div className="card overflow-hidden">
      {rows.map(([from, to]) => (
        <div
          key={from}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-line px-3.5 py-2.5 last:border-0 sm:gap-4 sm:px-4"
        >
          <span className="font-mono text-[13px] text-wine">{from}</span>
          <span className="text-mist">→</span>
          <span className="text-[13px] text-ink">{to}</span>
        </div>
      ))}
    </div>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[16px] border border-sun bg-sun-pale p-4">
      <p className="mb-1.5 font-semibold text-wine">{title}</p>
      <div className="text-sm leading-relaxed text-ink/80">{children}</div>
    </div>
  );
}

function Trouble({ problem, fix }: { problem: string; fix: string }) {
  return (
    <div className="border-l-2 border-wine pl-4">
      <p className="font-semibold text-ink">{problem}</p>
      <p className="mt-1 text-sm leading-relaxed text-ash">{fix}</p>
    </div>
  );
}
