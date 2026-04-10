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
} from "lucide-react";

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
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-zinc-50 via-white to-blue-50/40 text-zinc-900">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 md:px-8 md:pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/80 p-8 shadow-sm shadow-zinc-200/50 backdrop-blur-sm md:p-12 lg:p-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl"
            aria-hidden
          />

          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Text-first brainstorming
            </p>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
              Thinktank
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
              Replace noisy video calls with a calm, async room where everyone can
              contribute ideas, vote on what matters, and move toward better
              decisions—without talking over each other.
            </p>

            {currentUser ? (
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <p className="text-zinc-700">
                  Welcome back,{" "}
                  <span className="font-semibold text-zinc-900">
                    {currentUser.name}
                  </span>
                  .
                </p>
                <Link
                  href="/group"
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Open group rooms
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
                >
                  Create an account
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Why Thinktank */}
        <section className="mt-14 md:mt-20">
          <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Built for clarity, not calendar blocks
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-600">
            Async text rooms give people time to think, edit, and build on each
            other&apos;s ideas—then use votes to surface what the group actually
            wants to pursue.
          </p>

          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            <li className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <MessageSquare className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                Text-first rooms
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                No camera fatigue. Post ideas when you&apos;re ready; read and
                reply on your own schedule.
              </p>
            </li>
            <li className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-violet-200 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                Room for every voice
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Quieter teammates get equal space. Ideas stand on their merit,
                not who spoke loudest in the call.
              </p>
            </li>
            <li className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Vote className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-zinc-900">
                Vote & align
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Upvote ideas the group should prioritize— a simple signal before
                you lock in a decision.
              </p>
            </li>
          </ul>
        </section>

        {/* How it works */}
        <section className="mt-16 rounded-3xl border border-zinc-200 bg-zinc-50/80 p-8 md:mt-20 md:p-10">
          <h2 className="text-xl font-bold text-zinc-900 md:text-2xl">
            How a session flows
          </h2>
          <ol className="mt-8 space-y-6">
            {[
              {
                step: "1",
                title: "Create or join a room",
                body: "Start a meeting from your dashboard or open an existing room from the list.",
              },
              {
                step: "2",
                title: "Share ideas in writing",
                body: "Everyone adds ideas as short posts—easy to scan, quote, and build on.",
              },
              {
                step: "3",
                title: "Vote and decide",
                body: "Use votes to highlight strong options; the host can steer toward a clear next step.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Bottom CTA + links */}
        <section className="mt-14 text-center md:mt-16">
          <p className="text-sm font-medium text-zinc-500">
            Quick links
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            {currentUser ? (
              <Link
                href="/group"
                className="font-semibold text-blue-600 underline-offset-4 hover:underline"
              >
                group rooms
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 underline-offset-4 hover:underline"
                >
                  Log in
                </Link>
                <span className="text-zinc-300" aria-hidden>
                  ·
                </span>
                <Link
                  href="/signup"
                  className="text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          <p className="mx-auto mt-10 max-w-md text-xs leading-relaxed text-zinc-400">
            Thinktank is under active development. Summaries, meeting phases, and
            richer collaboration are planned—this page is your home base to jump
            into rooms.
          </p>
        </section>
      </div>
    </main>
  );
}
