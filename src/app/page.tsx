import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { ComposerShot } from "@/components/hero-shot";
import { SheetShot, PhoneShot, InboxShot } from "@/components/marketing-visuals";
import { LogoSlot } from "@/components/image-slot";
import { HeroFan } from "@/components/hero-fan";
import {
  AirmailRule,
  DeskScene,
  HeroBackdrop,
  Portrait,
  StudioDusk,
} from "@/components/illustrations";
import { createClient } from "@/lib/supabase/server";

/*
 * The public site.
 *
 * Two grounds and nothing else: white for the body, deep pine for the panels
 * that open and close the page. Brass (the existing sun) is the mark on pine,
 * wine the mark on white. Hairlines instead of shadows, no gradient anywhere.
 * Photography sits in reserved slots; see public/images/README.md.
 */

const SHELL = "mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12";
const WIDE = "mx-auto w-full max-w-[1560px] px-6 sm:px-8 lg:px-10";

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; signin?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !params.error) redirect("/app");

  return (
    <div className="pm-site min-h-dvh bg-snow">
      <SiteHeader />

      {params.error ? (
        <div className={`${SHELL} pt-5`}>
          <p className="border-l-2 border-wine bg-wine-pale px-4 py-3 text-[13px] text-wine">
            Google sign-in didn’t complete: {params.error}
          </p>
        </div>
      ) : null}

      <main>
        {/* ─────────────────────────────────────────────────────────── hero */}
        <section className="relative overflow-hidden bg-pine text-cream">
          <HeroBackdrop />
          <div className={`${SHELL} relative py-20 sm:py-24 lg:py-28`}>
            <div className="grid items-center gap-x-12 gap-y-16 lg:grid-cols-12">
              <div className="lg:col-span-7">
                {/* <p className="kicker text-cream/45">
                  Personalised sending · from your own Gmail
                </p> */}

                <h1 className="display mt-7 text-[clamp(2.15rem,4.4vw,3.3rem)] text-cream">
                  Send a hundred emails. Every one reads like{" "}
                  <span className="whitespace-nowrap text-sun">the only one</span>.
                </h1>

                <p className="measure mt-7 text-[16.5px] leading-[1.7] text-cream/70">
                  Bring a list with as many columns as you like, write one draft with merge tags,
                  and Permail sends a separate message to every row — from your address, not a
                  blast tool’s.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <SignInButton className="mbtn mbtn-brass" label="Start with Google" />
                  <Link href="#method" className="mbtn mbtn-onpine">
                    See how it works
                  </Link>
                </div>

                <p className="mt-6 font-mono text-[11px] leading-relaxed tracking-wider text-cream/40">
                  Free to start · No card · Send-only access
                </p>
              </div>

              <div className="min-w-0 lg:col-span-5">
                <HeroFan className="lg:ml-auto" />
              </div>
            </div>
          </div>

          <AirmailRule className="absolute inset-x-0 bottom-0" />
        </section>

        {/* ═══════════════════════════════════════════════════ the fan-out */}
        {/* Full bleed, no frame: the drawing's floor line continues straight
            into the rule beneath it, so the proof strip carries no top border. */}
        <section className="pt-10 sm:pt-14">
          <DeskScene />
        </section>

        {/* ─────────────────────────────────────────────────────────── proof */}
        <section className="border-b border-hair">
          <div className={`${SHELL} py-12 lg:py-14`}>
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <p className="kicker lg:col-span-3">Sent by people at</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-5 lg:col-span-9">
                {[
                  ["L1", "Wordmark"],
                  ["L2", "Wordmark"],
                  ["L3", "Wordmark"],
                  ["L4", "Wordmark"],
                  ["L5", "Wordmark"],
                ].map(([id, name]) => (
                  <LogoSlot key={id} id={id} name={name} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-hair">
          <div className={`${SHELL} grid grid-cols-2 gap-y-10 py-12 lg:grid-cols-4 lg:py-14`}>
            {[
              ["1 : 1", "One message per recipient. Never a BCC pile."],
              ["No limit", "Merge fields per list — you define the columns."],
              ["Zero", "Tracking pixels, footers or forwarding addresses."],
              ["5 min", "From signing in to your first campaign landing."],
            ].map(([value, label]) => (
              <div key={label} className="lg:border-l lg:border-hair lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                <p className="display text-[clamp(1.7rem,2.9vw,2.4rem)]">{value}</p>
                <p className="mt-2.5 max-w-[22ch] text-[13.5px] leading-relaxed text-stone">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── 01 write */}
        <section id="method" className={`${SHELL} scroll-mt-16 py-24 sm:py-32 lg:py-40`}>
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Numeral n="01" />
              <h2 className="display display-sm mt-6 text-[clamp(1.8rem,3.2vw,2.65rem)]">
                Write it once. It arrives a hundred different ways.
              </h2>
              <p className="mt-6 text-[15.5px] leading-[1.75] text-slate">
                No campaign builder to learn. Type the letter you would have typed anyway, drop a
                tag where a name belongs, and page through real previews recipient by recipient
                before anything leaves.
              </p>

              <ul className="mt-9 space-y-0">
                {[
                  ["Link your Gmail", "One sign-in. Permail asks for permission to send and nothing else."],
                  ["Bring your people", "Paste from a spreadsheet, upload a CSV, or type rows by hand."],
                  ["Send, and watch it land", "Delivery is reported per recipient, as it happens."],
                ].map(([title, body]) => (
                  <li key={title} className="border-t border-hair py-5 last:border-b">
                    <p className="text-[14.5px] font-medium text-graphite">{title}</p>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-stone">{body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 lg:col-span-8 lg:pt-14">
              <ComposerShot />
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────── 02 list */}
        <section className="border-y border-hair bg-bone">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="order-2 min-w-0 lg:order-1 lg:col-span-7">
                <SheetShot />
              </div>

              <div className="order-1 lg:order-2 lg:col-span-5 lg:pt-6">
                <Numeral n="02" />
                <h2 className="display display-sm mt-6 text-[clamp(1.8rem,3.2vw,2.65rem)]">
                  Every column becomes something you can say.
                </h2>
                <p className="mt-6 text-[15.5px] leading-[1.75] text-slate">
                  Add <Em>city</Em>, <Em>last order</Em>, <Em>the thing you admired about
                  their work</Em>. There is no fixed schema and no limit — type the tag in your
                  draft and it fills itself in, per person.
                </p>

                <dl className="mt-9 border-t border-hair">
                  {[
                    ["{{first_name}}", "Drops in that row’s value."],
                    ["{{company|your team}}", "Falls back when a cell is blank."],
                    ["{{First Name}}", "Matches first_name — case and spacing ignored."],
                  ].map(([tag, meaning]) => (
                    <div
                      key={tag}
                      className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-hair py-4"
                    >
                      <dt className="font-mono text-[12.5px] text-wine">{tag}</dt>
                      <dd className="text-[13.5px] text-stone">{meaning}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-7 text-[13.5px] leading-relaxed text-stone">
                  Before you can send, Permail flags any tag with no matching column and counts the
                  rows that would render empty — so nobody receives “Hi ,”.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════ the quote, and a face */}
        <section className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
          <div className="grid items-end gap-x-14 gap-y-12 lg:grid-cols-12">
            <div className="relative lg:col-span-4">
              {/* A flat disc, not a frame — the drawing sits over its edge. */}
              <div className="absolute left-10 top-14 h-[210px] w-[210px] rounded-full bg-bone sm:left-14 sm:top-20 sm:h-[265px] sm:w-[265px]" />
              <Portrait className="relative h-[300px] w-auto sm:h-[380px]" />
            </div>

            <div className="lg:col-span-8 lg:col-start-5">
              <blockquote>
                <p className="display display-sm text-[clamp(1.5rem,2.6vw,2.2rem)]">
                  “It goes out from my own address, so the replies come back to me. Not one person
                  has guessed it went to ninety others.”
                </p>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hair pt-5">
                <span className="text-[14px] text-graphite">Name Surname</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-stone">
                  Role, Company
                </span>
              </figcaption>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────── 03 delivery */}
        <section className="border-y border-hair bg-bone">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="lg:col-span-5 lg:pt-6">
                <Numeral n="03" />
                <h2 className="display display-sm mt-6 text-[clamp(1.8rem,3.2vw,2.65rem)]">
                  It arrives as an ordinary email, because that is what it is.
                </h2>
                <p className="mt-6 text-[15.5px] leading-[1.75] text-slate">
                  Each recipient gets their own message through your own Gmail account. No BCC
                  pile, no shared thread, no tracking pixel, and no unsubscribe footer stapled to
                  the bottom of something you wrote by hand.
                </p>

                <ul className="mt-9 space-y-4">
                  {[
                    "Replies come straight back to your inbox.",
                    "Your domain keeps the sending reputation it has earned.",
                    "Recipients see a normal conversation, because that’s what it is.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3.5 text-[14.5px] leading-relaxed text-slate">
                      <span className="mt-[7px] h-px w-4 shrink-0 bg-wine" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-0 lg:col-span-6 lg:col-start-7">
                <InboxShot />
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════ a breath */}
        <section className={`${SHELL} py-20 sm:py-28 lg:py-32`}>
          <p className="display display-sm mx-auto max-w-[26ch] text-center text-[clamp(1.4rem,2.6vw,2.15rem)]">
            Permail is for the letters you would have written one at a time, if there were enough
            hours.
          </p>
        </section>

        {/* ──────────────────────────────────────────────────────────── phone */}
        <section className="border-y border-hair bg-bone">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-36`}>
            <div className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="kicker">Anywhere</p>
                <h2 className="display display-sm mt-6 text-[clamp(1.8rem,3.2vw,2.65rem)]">
                  The whole of it, on the phone in your pocket.
                </h2>
                <p className="measure mt-6 text-[15.5px] leading-[1.75] text-slate">
                  Not a desktop tool with a mobile afterthought. The recipient sheet becomes
                  tappable cards, the composer splits into write and preview, and sending works the
                  same on a train as it does at a desk.
                </p>

                <div className="mt-9">
                  <SignInButton className="mbtn mbtn-wine" label="Start with Google" />
                </div>
              </div>

              <div className="lg:col-span-5 lg:col-start-8">
                <PhoneShot />
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────── faq */}
        <section id="questions" className={`${SHELL} scroll-mt-16 py-24 sm:py-32 lg:py-40`}>
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="kicker">Questions</p>
                <h2 className="display display-sm mt-6 text-[clamp(1.8rem,3.2vw,2.65rem)]">
                  Before you sign up.
                </h2>
              </div>
            </div>

            <dl className="lg:col-span-7 lg:col-start-6">
              {[
                [
                  "How many can I send at once?",
                  "Google sets the ceiling, not Permail: roughly 500 messages a day on a personal Gmail account and 2,000 on Workspace. Anything over the cap comes back as a failed recipient you can retry the next day.",
                ],
                [
                  "Can Permail read my email?",
                  "No. It requests a single permission — gmail.send — which allows sending and nothing else. Reading, searching and deleting are not part of that scope.",
                ],
                [
                  "What happens if a send is interrupted?",
                  "Nothing is lost. Sends run in batches and record each recipient as they go, so closing the tab mid-campaign simply pauses it. Reopen the campaign and it resumes where it stopped, without mailing anyone twice.",
                ],
                [
                  "Do I need a mailing list provider?",
                  "No. Your recipients live in Permail as a plain sheet you own, and mail goes out through the Gmail account you already have.",
                ],
              ].map(([question, answer]) => (
                <div key={question} className="border-t border-hair py-7 last:border-b">
                  <dt className="text-[16px] leading-snug text-graphite">{question}</dt>
                  <dd className="measure mt-3 text-[14.5px] leading-[1.75] text-slate">{answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────── cta */}
        <section className="relative overflow-hidden bg-pine text-cream">
          <StudioDusk className="pointer-events-none absolute -right-16 bottom-0 hidden w-[1150px] sm:block" />
          <div className={`${SHELL} relative py-28 sm:py-36 lg:py-44`}>
            <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <h2 className="display display-sm text-[clamp(2rem,4.2vw,3.5rem)] text-cream">
                  Your next hundred emails, each one written to{" "}
                  <span className="whitespace-nowrap text-sun">one person</span>.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:pt-3">
                <p className="measure text-[15.5px] leading-[1.7] text-cream/65">
                  Connect your Gmail and send your first personalised campaign in about five
                  minutes.
                </p>
                <div className="mt-8">
                  <SignInButton
                    className="mbtn mbtn-brass w-full sm:w-auto"
                    label="Continue with Google"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────── parts */

function Em({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-graphite">{children}</span>;
}

function Numeral({ n }: { n: string }) {
  return (
    <span className="flex items-center gap-4">
      <span className="font-mono text-[11px] tracking-[0.2em] text-wine">{n}</span>
      <span className="h-px flex-1 bg-hair" />
    </span>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-pine">
      <div className={`${SHELL} flex h-16 items-center justify-between gap-6 text-cream`}>
        <Wordmark />

        <nav className="hidden items-center gap-9 md:flex">
          {[
            ["How it works", "#method"],
            ["Questions", "#questions"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-[13.5px] text-cream/65 transition-colors hover:text-cream"
            >
              {label}
            </a>
          ))}
        </nav>

        <SignInButton className="mbtn mbtn-sm mbtn-brass" label="Sign in" />
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-snow">
      <div className={`${SHELL} py-16 lg:py-20`}>
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5 text-graphite">
            <Wordmark />
            <p className="measure mt-5 text-[14px] leading-relaxed text-stone">
              Personalised bulk email, sent from the address your recipients already know.
            </p>
          </div>

          {[
            ["Product", [["How it works", "#method"], ["Questions", "#questions"], ["Guide", "/app/guide"]]],
            ["Legal", [["Privacy", "/privacy"], ["Terms", "/terms"]]],
          ].map(([heading, links]) => (
            <div key={heading as string} className="lg:col-span-2">
              <p className="kicker">{heading as string}</p>
              <ul className="mt-5 space-y-3">
                {(links as string[][]).map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-[13.5px] text-slate transition-colors hover:text-graphite"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <p className="kicker">Sending</p>
            <p className="mt-5 text-[13.5px] leading-relaxed text-slate">
              Delivered through the Gmail API on your own OAuth grant. Permail holds a single
              permission: send.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-hair pt-7">
          <p className="font-mono text-[11px] tracking-wider text-stone">
            © {new Date().getFullYear()} Permail
          </p>
          <p className="font-mono text-[11px] tracking-wider text-stone">
            Made for people who would rather write one at a time
          </p>
        </div>
      </div>
    </footer>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-baseline gap-[3px] text-current">
      <span className="display text-[20px] font-semibold tracking-[-0.045em] text-current">
        Permail
      </span>
      <span className="h-[5px] w-[5px] rounded-full bg-sun" />
    </Link>
  );
}
