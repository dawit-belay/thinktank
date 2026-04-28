import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Sparkles,
  Users,
  Vote,
  CheckSquare,
} from "lucide-react";
import LiveDemoCard from "@/components/home/LiveDemoCard";

const FEATURES = [
  {
    icon: MessageSquare,
    iconClass: "bg-blue-100 text-blue-700",
    hoverBorder: "hover:border-blue-200",
    title: "Text-first rooms",
    body: "No camera fatigue. Post ideas when you're ready; read and reply on your own schedule.",
  },
  {
    icon: Users,
    iconClass: "bg-violet-100 text-violet-700",
    hoverBorder: "hover:border-violet-200",
    title: "Room for every voice",
    body: "Quieter teammates get equal space. Ideas stand on their merit, not who spoke loudest.",
  },
  {
    icon: Vote,
    iconClass: "bg-emerald-100 text-emerald-700",
    hoverBorder: "hover:border-emerald-200",
    title: "Vote & align",
    body: "Upvote the ideas the group should pursue — a clear signal before locking in a decision.",
  },
  {
    icon: CheckSquare,
    iconClass: "bg-amber-100 text-amber-700",
    hoverBorder: "hover:border-amber-200",
    title: "Track action items",
    body: "Assign tasks from each meeting with due dates and status tracking so nothing falls through.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create a room",
    body: "Start a meeting from your group. Pick a template or go blank.",
  },
  {
    n: "02",
    title: "Share ideas",
    body: "Everyone posts ideas as short text — easy to read, quote, and build on.",
  },
  {
    n: "03",
    title: "Vote & react",
    body: "Upvotes and emoji reactions surface what the team actually cares about.",
  },
  {
    n: "04",
    title: "Decide & track",
    body: "Record the decision, write a summary, and assign follow-up action items.",
  },
];

const FEATURE_TAGS = [
  "Threaded comments",
  "Emoji reactions",
  "Action items",
  "Anonymous mode",
  "Meeting templates",
  "Decision archive",
];

export default async function Home() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  let currentUser = null;
  if (userId) {
    currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] text-zinc-900">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-emerald-50/50 to-violet-50/25 px-5 pb-24 pt-16 md:px-10 md:pt-24">
        {/* Animated background blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-40 -top-10 h-[32rem] w-[32rem] rounded-full bg-emerald-300/20 blur-3xl"
            style={{ animation: "blob 9s ease-in-out infinite" }}
          />
          <div
            className="absolute right-0 top-16 h-[26rem] w-[26rem] rounded-full bg-violet-300/15 blur-3xl"
            style={{ animation: "blob 11s ease-in-out infinite 2s" }}
          />
          <div
            className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-blue-300/10 blur-3xl"
            style={{ animation: "blob 13s ease-in-out infinite 4s" }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Left — copy */}
            <div style={{ animation: "fade-up 0.6s ease-out forwards" }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Text-first · Async · Real-time
              </div>

              <h1 className="text-5xl font-black leading-[1.07] tracking-tight text-zinc-900 md:text-[3.5rem] lg:text-[4rem]">
                Think together.{" "}
                <span className="text-emerald-600">Decide faster.</span>
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-600">
                Replace noisy video calls with a calm, async room where everyone
                can contribute ideas, vote on what matters, and reach better
                decisions — without talking over each other.
              </p>

              {currentUser ? (
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <p className="text-zinc-600">
                    Welcome back,{" "}
                    <span className="font-bold text-zinc-900">
                      {currentUser.name}
                    </span>
                    .
                  </p>
                  <Link
                    href="/group"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/30"
                  >
                    Open group rooms
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              ) : (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/30"
                  >
                    Get started free
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white/80 px-6 py-3 text-sm font-semibold text-zinc-700 backdrop-blur-sm transition hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {/* Feature tags */}
              <div className="mt-8 flex flex-wrap gap-2">
                {FEATURE_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-zinc-200/80 bg-white/70 px-3 py-1 text-xs font-medium text-zinc-500 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — live demo */}
            <div
              className="flex justify-center lg:justify-end"
              style={{ animation: "fade-up 0.6s ease-out 0.15s both" }}
            >
              <div className="w-full max-w-sm">
                <LiveDemoCard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              Built for clarity, not calendar blocks
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-500">
              Async text rooms give people time to think, edit, and build on
              each other&apos;s ideas — then votes surface what the group
              actually wants to pursue.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, iconClass, hoverBorder, title, body }) => (
              <div
                key={title}
                className={`group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${hoverBorder}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="bg-zinc-50/80 px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              How a session flows
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-zinc-500">
              From idea dump to signed-off decision — four stages, zero scheduling loops.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative flex flex-col">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[2.6rem] top-5 hidden h-px w-[calc(100%+2.5rem)] bg-gradient-to-r from-zinc-300 to-transparent md:block" />
                )}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white shadow-md shadow-emerald-600/30">
                  {step.n}
                </div>
                <h3 className="mt-4 font-bold text-zinc-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 px-5 py-16 text-center md:px-10 md:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 left-16 h-56 w-56 rounded-full bg-emerald-900/25 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Ready to replace your next video call?
          </h2>
          <p className="mt-4 text-emerald-100">
            Start a room, invite your team, and see how much clearer decisions
            can be.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {currentUser ? (
              <Link
                href="/group"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Open group rooms
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-emerald-400/60 px-7 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-emerald-600/50"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
