import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { SiteHeader, Wordmark } from "@/components/site-chrome";
import { LetterDeck } from "@/components/letter-deck";
import { ComposerShot } from "@/components/hero-shot";
import { SheetShot, PhoneShot, InboxShot } from "@/components/marketing-visuals";
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
 * that open and close the page. Brass is the mark on pine, wine the mark on
 * white. Hairlines instead of shadows, no gradient anywhere.
 *
 * Three things govern this page beyond the look of it:
 *
 * 1. Type is set in tiers (`type-hero`, `type-display`, …) that carry their own
 *    tracking and leading. Nothing here sets a font size on its own, because a
 *    size without the tracking that belongs to it is wrong at one end of the
 *    scale or the other.
 * 2. The header is a material, not a bar — see components/site-chrome.tsx.
 * 3. Every claim on the page is one the product can actually keep. There is no
 *    borrowed logo wall and no invented testimonial; where social proof would
 *    normally sit, the page explains the mechanism instead, because that is
 *    the thing we can stand behind today.
 */

const SHELL = "mx-auto w-full max-w-[1240px] px-6 sm:px-8 lg:px-12";

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
          <p className="type-meta border-l-2 border-wine bg-wine-pale px-4 py-3 text-wine">
            Google sign-in didn’t complete: {params.error}
          </p>
        </div>
      ) : null}

      <main>
        {/* ─────────────────────────────────────────────────────────── hero */}
        <section className="relative overflow-hidden bg-pine text-cream">
          <HeroBackdrop />

          <div className={`${SHELL} relative pb-20 pt-12 sm:pb-24 sm:pt-16 lg:pb-28`}>
            <div className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="kicker text-cream/45">Personalised sending · from your own Gmail</p>

                <h1 className="type-hero mt-7 text-cream">
                  Send a hundred emails. Every one reads like{" "}
                  <span className="whitespace-nowrap text-sun">the only one</span>.
                </h1>

                <p className="type-lead measure mt-7 text-cream/70">
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

                <p className="mt-7 font-mono text-[11px] leading-relaxed tracking-wider text-cream/40">
                  Free to start · No card · Send-only access
                </p>
              </div>

              {/*
                The claim, as something you can pick up and flick through. It is
                the one piece of this page that is worth the JavaScript: reading
                "every one reads like the only one" is not the same as pulling
                five of them past your eyes.
              */}
              <div className="min-w-0 lg:col-span-6 lg:pl-6">
                <LetterDeck className="lg:ml-auto" />
              </div>
            </div>
          </div>

          <AirmailRule className="absolute inset-x-0 bottom-0" />
        </section>

        {/* ═══════════════════════════════════════════════════ the fan-out */}
        {/* Full bleed, no frame: the drawing's floor line continues straight
            into the rule beneath it, so the section below carries no border. */}
        <section className="pt-10 sm:pt-14">
          <DeskScene />
        </section>

        {/* ───────────────────────────────────────────────── what you get */}
        {/*
          A logo wall sat here, filled with five placeholder wordmarks, and a
          quote attributed to "Name Surname, Role, Company". Both have gone.
          Borrowed credibility is still borrowed when the names are fake, and a
          visitor who recognises the placeholder learns something true and
          unhelpful about everything else on the page. These four are checkable
          instead — they are what the sender is promised, and each one is a
          property of how the thing actually works.
        */}
        <section id="guarantees" className="scroll-mt-20 border-b border-hair">
          <div className="reveal">
            <div className={`${SHELL} grid grid-cols-2 gap-x-8 gap-y-10 py-14 lg:grid-cols-4 lg:py-16`}>
              {[
                ["1 : 1", "One message per recipient. Never a BCC pile, never a shared thread."],
                ["No limit", "Merge fields per list — you define the columns, not a template."],
                ["Zero", "Tracking pixels, injected footers and forwarding addresses."],
                ["5 min", "From signing in to your first campaign landing in an inbox."],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="lg:border-l lg:border-hair lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
                >
                  <p className="type-title">{value}</p>
                  <p className="type-meta mt-2.5 max-w-[24ch] text-stone">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────── 01 write */}
        <section id="method" className={`${SHELL} scroll-mt-20 py-24 sm:py-32 lg:py-40`}>
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="reveal lg:col-span-4">
              <Numeral n="01" />
              <h2 className="type-display mt-6">
                Write it once. It arrives a hundred different ways.
              </h2>
              <p className="type-lead mt-6 text-slate">
                No campaign builder to learn. Type the letter you would have typed anyway, drop a
                tag where a name belongs, and page through real previews recipient by recipient
                before anything leaves.
              </p>

              <ul className="mt-9">
                {[
                  ["Link your Gmail", "One sign-in. Permail asks for permission to send and nothing else."],
                  ["Bring your people", "Paste from a spreadsheet, upload a CSV, or type rows by hand."],
                  ["Send, and watch it land", "Delivery is reported per recipient, as it happens."],
                ].map(([title, body]) => (
                  <li key={title} className="border-t border-hair py-5 last:border-b">
                    <p className="text-[14.5px] font-medium tracking-[-0.01em] text-graphite">
                      {title}
                    </p>
                    <p className="type-meta mt-1.5 text-stone">{body}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="reveal reveal-late min-w-0 lg:col-span-8 lg:pt-14">
              <ComposerShot />
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────────── 02 list */}
        <section className="border-y border-hair bg-bone">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="reveal order-2 min-w-0 lg:order-1 lg:col-span-7">
                <SheetShot />
              </div>

              <div className="reveal reveal-late order-1 lg:order-2 lg:col-span-5 lg:pt-6">
                <Numeral n="02" />
                <h2 className="type-display mt-6">
                  Every column becomes something you can say.
                </h2>
                <p className="type-lead mt-6 text-slate">
                  Add <Em>city</Em>, <Em>last order</Em>, <Em>the thing you admired about their
                  work</Em>. There is no fixed schema and no limit — type the tag in your draft and
                  it fills itself in, per person.
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
                      <dt className="font-mono text-[12.5px] tracking-[0.01em] text-wine">{tag}</dt>
                      <dd className="type-meta text-stone">{meaning}</dd>
                    </div>
                  ))}
                </dl>

                <p className="type-meta mt-7 text-stone">
                  Before you can send, Permail flags any tag with no matching column and counts the
                  rows that would render empty — so nobody receives “Hi ,”.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════ what it is for */}
        {/*
          This is where the invented customer quote used to be. The drawing
          stays, because the page wants a human at this point in the scroll —
          but it now illustrates our own position rather than impersonating
          someone else's.
        */}
        <section className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
          <div className="grid items-end gap-x-14 gap-y-12 lg:grid-cols-12">
            <div className="reveal relative lg:col-span-4">
              {/* A flat disc, not a frame — the drawing sits over its edge. */}
              <div className="absolute left-10 top-14 h-[210px] w-[210px] rounded-full bg-bone sm:left-14 sm:top-20 sm:h-[265px] sm:w-[265px]" />
              <Portrait className="relative h-[300px] w-auto sm:h-[380px]" />
            </div>

            <div className="reveal reveal-late lg:col-span-8 lg:col-start-5">
              <p className="kicker">What it’s for</p>
              <p className="type-quote mt-6">
                Permail is for the letters you would have written one at a time, if there were
                enough hours. It goes out from your own address, so the replies come back to you —
                and nobody receiving one has any way of telling it went to ninety others.
              </p>
              <p className="type-body measure mt-7 border-t border-hair pt-6 text-slate">
                That is the whole design goal, and it is also the constraint. Permail will not add
                tracking, it will not rewrite your links, and it will not staple anything to the
                bottom of a message you wrote by hand.
              </p>
            </div>
          </div>
        </section>

        {/* ───────────────────────────────────────────────────── 03 delivery */}
        <section className="border-y border-hair bg-bone">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-40`}>
            <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="reveal lg:col-span-5 lg:pt-6">
                <Numeral n="03" />
                <h2 className="type-display mt-6">
                  It arrives as an ordinary email, because that is what it is.
                </h2>
                <p className="type-lead mt-6 text-slate">
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
                      <span className="mt-[11px] h-px w-4 shrink-0 bg-wine" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reveal reveal-late min-w-0 lg:col-span-6 lg:col-start-7">
                <InboxShot />
              </div>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────── phone */}
        <section className="border-b border-hair">
          <div className={`${SHELL} py-24 sm:py-32 lg:py-36`}>
            <div className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-12">
              <div className="reveal lg:col-span-5">
                <p className="kicker">Anywhere</p>
                <h2 className="type-display mt-6">The whole of it, on the phone in your pocket.</h2>
                <p className="type-lead measure mt-6 text-slate">
                  Not a desktop tool with a mobile afterthought. The recipient sheet becomes
                  tappable cards, the composer splits into write and preview, and sending works the
                  same on a train as it does at a desk.
                </p>

                <div className="mt-9">
                  <SignInButton className="mbtn mbtn-wine" label="Start with Google" />
                </div>
              </div>

              <div className="reveal reveal-late lg:col-span-5 lg:col-start-8">
                <PhoneShot />
              </div>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────── faq */}
        {/*
          Answers stay open. A disclosure row would look tidier and read as
          four locked doors — on a page someone is using to decide whether to
          trust us with their Gmail, the answers are the point.
        */}
        <section id="questions" className={`${SHELL} scroll-mt-20 py-24 sm:py-32 lg:py-40`}>
          <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="kicker">Questions</p>
                <h2 className="type-display mt-6">Before you sign up.</h2>
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
                  <dt className="text-[16px] leading-snug tracking-[-0.012em] text-graphite">
                    {question}
                  </dt>
                  <dd className="type-body measure mt-3 text-slate">{answer}</dd>
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
                <h2 className="type-hero text-cream">
                  Your next hundred emails, each one written to{" "}
                  <span className="whitespace-nowrap text-sun">one person</span>.
                </h2>
              </div>
              <div className="lg:col-span-4 lg:pt-3">
                <p className="type-lead measure text-cream/65">
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

function SiteFooter() {
  return (
    <footer className="bg-snow">
      <div className={`${SHELL} py-16 lg:py-20`}>
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="text-graphite lg:col-span-5">
            <Wordmark />
            <p className="type-meta measure mt-5 text-stone">
              Personalised bulk email, sent from the address your recipients already know.
            </p>
          </div>

          {[
            [
              "Product",
              [
                ["How it works", "#method"],
                ["What you get", "#guarantees"],
                ["Questions", "#questions"],
                ["Guide", "/app/guide"],
              ],
            ],
            ["Legal", [["Privacy", "/privacy"], ["Terms", "/terms"]]],
          ].map(([heading, links]) => (
            <div key={heading as string} className="lg:col-span-2">
              <p className="kicker">{heading as string}</p>
              <ul className="mt-5 space-y-3">
                {(links as string[][]).map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="press type-meta text-slate hover:text-graphite">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <p className="kicker">Sending</p>
            <p className="type-meta mt-5 text-slate">
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
