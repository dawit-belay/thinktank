import { db } from "@/db";
import { meetings,ideas,users, groups, groupMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { submitIdea } from "@/app/actions";
import { cookies } from "next/headers";
import VoteButton from "@/components/VoteButton";
import Link from "next/link";
import { ArrowLeft, Lightbulb, PlusCircle, Sparkles, Users } from "lucide-react";

import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import DeleteIdeaButton from "@/components/DeleteIdeaButton";

import AddMeetingMembersButton from "@/components/AddMeetingMembersButton";


interface MeetingPageProps {
  params: Promise<{ meetingId: string, groupId: string}>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId } = await params;
  const { groupId } = await params;

  // Get the current user's ID to check if they've already voted
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("user_id")?.value;

  

  // Fetch the specific meeting from Docker
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) notFound();

  const isOwner = meeting.creatorId === currentUserId;

  // Fetch ideas with Authors AND Votes using Relational Queries
  const meetingIdeas = await db.query.ideas.findMany({
    where: eq(ideas.meetingId, meetingId),
    with: {
      author: true,
      votes: true, // This brings in the array of votes for each idea
    },
    orderBy: (ideas, { desc }) => [desc(ideas.createdAt)],
  });

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  const myGroupMembership = currentUserId
    ? await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, currentUserId)
        ),
      })
    : null;

  const canManageMeetingMembers =
    isOwner ||
    group?.creatorId === currentUserId ||
    myGroupMembership?.role === "admin";

  return (
   <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50/90 via-stone-50 to-zinc-100 px-5 pb-20 pt-10 md:px-8 md:pt-14">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-36 top-0 h-[30rem] w-[30rem] rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute right-0 top-20 h-[24rem] w-[24rem] rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-3 text-sm">
          <Link
            href={`/group/${groupId}`}
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 font-medium text-zinc-600 shadow-sm shadow-zinc-200/50 transition hover:border-emerald-300 hover:text-emerald-800"
          >
            <ArrowLeft size={16} className="transition group-hover:-translate-x-0.5" />
            Back to group
          </Link>
          <span className="text-zinc-400" aria-hidden>/</span>
          <span className="max-w-[16rem] truncate font-medium text-zinc-700">
            Meeting room
          </span>
        </nav>

        <header className="mb-10 grid gap-6 rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-sm shadow-zinc-200/40 backdrop-blur-sm md:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              <Sparkles size={14} className="text-emerald-600" />
              Meeting Room
            </div>
            <h1 className="text-balance text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              {meeting.title}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Organized by <span className="font-semibold">{isOwner ? "You" : "a colleague"}</span>
              {" · "}
              <span className="font-semibold">{meetingIdeas.length}</span> ideas shared
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageMeetingMembers && (
              <AddMeetingMembersButton
                meetingId={meetingId}
                canManage={!!canManageMeetingMembers}
              />
            )}
            {isOwner && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/90 px-2 py-1.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Meeting Admin
                </span>
                <DeleteMeetingButton id={meetingId} groupId={groupId} />
              </div>
            )}
          </div>
        </header>

        <section className="mb-10 rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm shadow-zinc-200/40 md:p-5">
          <form action={submitIdea} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="meetingId" value={meetingId} />
            <input type="hidden" name="groupId" value={groupId} />

            <div className="relative flex-1">
              <Lightbulb
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-500"
              />
              <input
                name="content"
                placeholder="Type a new idea..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 py-3 pl-10 pr-3 text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600"
            >
              <PlusCircle size={16} />
              Add Idea
            </button>
          </form>
        </section>

        <section>
          <div className="mb-6 flex items-center gap-2 text-zinc-700">
            <Users size={18} className="text-emerald-600" />
            <p className="text-sm font-semibold uppercase tracking-wide">
              Ideas Board
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {meetingIdeas.map((idea) => {
              const hasVoted = idea.votes.some((v) => v.userId === currentUserId);
              const canDelete = idea.authorId === currentUserId || isOwner;

              return (
                <article
                  key={idea.id}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-sm shadow-zinc-200/40 transition hover:shadow-md hover:shadow-zinc-300/40"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/45 blur-2xl"
                  />

                  {canDelete && (
                    <div className="absolute right-3 top-3 z-20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <DeleteIdeaButton
                        ideaId={idea.id}
                        meetingId={meetingId}
                        groupId={groupId}
                      />
                    </div>
                  )}

                  <p className="relative pr-8 text-zinc-800">{idea.content}</p>

                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-700">
                        {idea.author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">
                          {idea.author.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400">
                          Contributor
                        </p>
                      </div>
                    </div>

                    <VoteButton
                      ideaId={idea.id}
                      meetingId={meetingId}
                      count={idea.votes.length}
                      hasVoted={hasVoted}
                      groupId={groupId}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}