import { db } from "@/db";
import { meetings, groups, groupMembers, meetingMembers, ideas } from "@/db/schema";
import { eq, and, isNotNull, ilike, or, desc, count } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, CalendarDays, Lightbulb, Users, ArrowRight } from "lucide-react";
import { MEETING_TEMPLATES } from "@/lib/templates";
import DecisionSearch from "@/components/DecisionSearch";

interface Props {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function DecisionsPage({ params, searchParams }: Props) {
  const { groupId } = await params;
  const { q } = await searchParams;
  const keyword = q?.trim() ?? "";

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) notFound();

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  if (!group) notFound();

  const membership = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)),
  });
  if (!membership && group.creatorId !== userId) notFound();

  const whereClause = keyword.length >= 2
    ? and(
        eq(meetings.groupId, groupId),
        isNotNull(meetings.decisionText),
        or(
          ilike(meetings.title, `%${keyword}%`),
          ilike(meetings.decisionText, `%${keyword}%`),
        )
      )
    : and(eq(meetings.groupId, groupId), isNotNull(meetings.decisionText));

  const decisionMeetings = await db.query.meetings.findMany({
    where: whereClause,
    with: {
      ideas: true,
      members: { with: { user: true } },
    },
    orderBy: [desc(meetings.closedAt), desc(meetings.createdAt)],
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-violet-50/80 via-stone-50 to-zinc-100 px-5 pb-20 pt-10 md:px-8 md:pt-14">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-36 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-300/25 blur-3xl" />
        <div className="absolute right-0 top-20 h-[22rem] w-[22rem] rounded-full bg-sky-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <nav className="mb-8 flex items-center gap-3 text-sm">
          <Link
            href={`/group/${groupId}`}
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 font-medium text-zinc-600 shadow-sm transition hover:border-violet-300 hover:text-violet-800"
          >
            <ArrowLeft size={16} className="transition group-hover:-translate-x-0.5" />
            {group.name}
          </Link>
          <span className="text-zinc-400">/</span>
          <span className="font-medium text-zinc-700">Decision Archive</span>
        </nav>

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <BookMarked size={22} className="text-violet-600" />
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              Decision Archive
            </h1>
          </div>
          <p className="text-sm text-zinc-500">
            {decisionMeetings.length} decision{decisionMeetings.length !== 1 ? "s" : ""} logged in <span className="font-semibold text-zinc-700">{group.name}</span>
          </p>
        </header>

        <DecisionSearch groupId={groupId} initialQuery={keyword} />

        {decisionMeetings.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-violet-200 bg-white/70 px-8 py-16 text-center">
            <BookMarked size={36} className="mx-auto mb-3 text-violet-400/70" strokeWidth={1.25} />
            <p className="font-semibold text-zinc-700">
              {keyword ? `No decisions match "${keyword}"` : "No decisions yet"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {keyword
                ? "Try a different keyword."
                : "Decisions are recorded when a meeting advances past the ideation stage."}
            </p>
          </div>
        ) : (
          <ol className="mt-6 space-y-4">
            {decisionMeetings.map((meeting) => {
              const template = meeting.templateType
                ? MEETING_TEMPLATES[meeting.templateType as keyof typeof MEETING_TEMPLATES]
                : null;
              const date = meeting.closedAt ?? meeting.createdAt;

              return (
                <li
                  key={meeting.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-sm shadow-zinc-200/40 transition hover:shadow-md hover:shadow-zinc-300/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-200/30 blur-2xl"
                  />

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {template && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                        {template.emoji} {template.label}
                      </span>
                    )}
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                      {meeting.stage}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <CalendarDays size={11} />
                      {new Date(date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-zinc-900">{meeting.title}</h2>

                  <blockquote className="mt-2 border-l-2 border-violet-300 pl-3 text-sm leading-relaxed text-zinc-700">
                    {meeting.decisionText}
                  </blockquote>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Lightbulb size={12} className="text-amber-500" />
                        {meeting.ideas.length} idea{meeting.ideas.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {meeting.members.length} participant{meeting.members.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <Link
                      href={`/group/${groupId}/${meeting.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
                    >
                      View meeting
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
