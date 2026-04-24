import { cookies } from "next/headers";
import { db } from "@/db";
import { meetings, users, ideas, groups, groupMembers, meetingMembers } from "@/db/schema";
import Link from "next/link";
import { eq, desc, count, and,or, inArray } from "drizzle-orm";
import { Outfit } from "next/font/google";
import {
  ArrowLeft,
  DoorOpen,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
} from "lucide-react";

import MeetingCard from "@/components/MeetingCard";
import AddMembersButton from "@/components/AddMembersButton";
import CreateMeetingButton from "@/components/CreateMeetingButton";
import GroupMeetingsRealtime from "@/components/GroupMeetingsRealtime";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId!),
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const [myMeetingsCount] = await db
    .select({ count: count() })
    .from(meetings)
    .where(eq(meetings.creatorId, userId!));

  const [myIdeasCount] = await db
    .select({ count: count() })
    .from(ideas)
    .where(eq(ideas.authorId, userId!));

  const myIdeas = await db.query.ideas.findMany({
    where: eq(ideas.authorId, userId!),
    with: { votes: true },
  });
  const totalKarma = myIdeas.reduce((acc, idea) => acc + idea.votes.length, 0);


  const memberMeetingIdsQuery = db
    .select({ meetingId: meetingMembers.meetingId })
    .from(meetingMembers)
    .where(eq(meetingMembers.userId, userId));

  const allMeetings = await db.query.meetings.findMany({
    where: and(
      eq(meetings.groupId, groupId),
      or(
        inArray(meetings.id, memberMeetingIdsQuery),eq(meetings.creatorId,userId!))
     ),
    orderBy: [desc(meetings.createdAt)],
    with: {
      ideas: true,
      members: true,
    },
  });

  const memberships = await db.query.meetingMembers.findMany({
    where: eq(meetingMembers.userId, userId),
  });
  const roleByMeetingId = new Map(
    memberships.map((membership) => [membership.meetingId, membership.role])
  );

  const groupRow = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  const myMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId!)
    ),
  });

  const [memberCountRow] = await db
    .select({ count: count() })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  const memberCount = Number(memberCountRow?.count ?? 0);

  const canManageMembers =
    groupRow?.creatorId === userId || myMembership?.role === "admin";

  const roleLabel =
    groupRow?.creatorId === userId
      ? "Owner"
      : myMembership?.role === "admin"
        ? "Admin"
        : "Member";

  const groupTitle = groupRow?.name ?? "Group workspace";
  const groupDescription =
    groupRow?.description?.trim() ||
    "Brainstorm with your team in focused rooms. Every voice counts.";

  return (
    <main
      className={`${outfit.className} relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50/90 via-stone-50 to-zinc-100 text-zinc-900`}
    >
      <GroupMeetingsRealtime groupId={groupId} />
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-[38rem] w-[38rem] rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute -right-32 top-[12%] h-[34rem] w-[34rem] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-[20%] h-72 w-96 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.5)_0%,transparent_45%,rgba(244,244,245,0.95)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.035'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-10 md:px-8 md:pt-14">
        <nav className="mb-10 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/group"
            className="group inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 font-medium text-zinc-600 shadow-sm shadow-zinc-200/50 backdrop-blur-sm transition hover:border-emerald-300 hover:text-emerald-800"
          >
            <ArrowLeft
              size={16}
              className="transition group-hover:-translate-x-0.5"
            />
            All groups
          </Link>
          <span className="text-zinc-400" aria-hidden>
            /
          </span>
          <span className="max-w-[min(100%,14rem)] truncate font-medium text-zinc-800">
            {groupTitle}
          </span>
        </nav>

        <header className="mb-14 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              <Sparkles size={14} className="text-emerald-600" />
              Workspace
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {groupTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 md:text-lg">
              {groupDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40">
                <Users size={14} className="text-zinc-500" />
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40">
                <Shield size={14} className="text-violet-600" />
                You’re {roleLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-200/40">
                <DoorOpen size={14} className="text-zinc-500" />
                {allMeetings.length}{" "}
                {allMeetings.length === 1 ? "room" : "rooms"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <CreateMeetingButton groupId={groupId} />
            <AddMembersButton
              groupId={groupId}
              canManage={!!canManageMembers}
            />
          </div>
        </header>

        <p className="mb-10 text-sm text-zinc-600">
          Signed in as{" "}
          <span className="font-semibold text-zinc-900">{currentUser.name}</span>
          {" · "}
          Your activity in Thinktank
        </p>

        <section className="mb-16 grid gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-md shadow-zinc-200/40 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-200/50 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Rooms created
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900">
                  {myMeetingsCount.count}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-blue-600">
                <DoorOpen size={22} strokeWidth={1.75} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-md shadow-zinc-200/40 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-200/45 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Ideas shared
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-zinc-900">
                  {myIdeasCount.count}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-amber-600">
                <Lightbulb size={22} strokeWidth={1.75} />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-md shadow-zinc-200/40 backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-200/40 blur-2xl" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Karma
                </p>
                <p className="mt-2 text-4xl font-bold tabular-nums text-orange-600">
                  +{totalKarma}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-orange-600">
                <TrendingUp size={22} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
                Brainstorming rooms
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Open a room to capture ideas and vote as a team.
              </p>
            </div>
          </div>

          {allMeetings.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {allMeetings.map((meeting) => {
                const isAdmin =
                  meeting.creatorId === userId ||
                  roleByMeetingId.get(meeting.id) === "admin";
                return (
                  <MeetingCard
                    key={meeting.id}
                    groupId={groupId}
                    meetingid={meeting.id}
                    meeting={meeting}
                    isOwner={meeting.creatorId === userId}
                    isAdmin={isAdmin}
                  />
                );
              }
                

              )}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-200/80 bg-white/70 px-8 py-20 text-center shadow-sm shadow-zinc-200/30 backdrop-blur-sm">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
              <DoorOpen
                className="mx-auto mb-4 text-emerald-600/70"
                size={40}
                strokeWidth={1.25}
              />
              <p className="text-lg font-semibold text-zinc-800">
                No rooms yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-600">
                Create your first brainstorming room and invite the group to
                share ideas.
              </p>
              <div className="mt-8">
                <CreateMeetingButton
                  groupId={groupId}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
