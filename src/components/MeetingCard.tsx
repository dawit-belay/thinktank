import Link from "next/link";
import DeleteMeetingButton from "./DeleteMeetingButton";
import { Calendar, ArrowUpRight, Lightbulb, Users } from "lucide-react";

export default function MeetingCard({
  meeting,
  meetingid,
  groupId,
  isOwner,
  isAdmin,
}: {
  groupId: string;
  meeting: {
    id: string;
    title: string;
    createdAt: Date | string;
    stage: "ideation" | "decision" | "summary";
    ideas: { id: string }[];
    members: { userId: string }[];
  };
  meetingid: string;
  isOwner: boolean;
  isAdmin: boolean;
}) {
  const stageStyles = {
    ideation: "border-emerald-200 bg-emerald-50 text-emerald-800",
    decision: "border-amber-200 bg-amber-50 text-amber-800",
    summary: "border-violet-200 bg-violet-50 text-violet-800",
  };

  return (
    <div className="group/card relative flex h-[13.5rem] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-md shadow-zinc-200/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-300/80 hover:shadow-lg hover:shadow-emerald-500/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-2xl transition-opacity group-hover/card:opacity-100"
      />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${stageStyles[meeting.stage]}`}
          >
            {meeting.stage}
          </span>

          {isOwner && (
            <DeleteMeetingButton
              id={meeting.id}
              groupId={groupId}
              variant="light"
            />
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors group-hover/card:text-emerald-700">
            {meeting.title}
          </h3>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              isAdmin
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-zinc-200 bg-zinc-100 text-zinc-600"
            }`}
          >
            {isAdmin ? "Admin" : "Member"}
          </span>
          
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-zinc-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
            <Lightbulb size={13} className="text-amber-500" />
            {meeting.ideas.length} {meeting.ideas.length === 1 ? "idea" : "ideas"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1">
            <Users size={13} className="text-emerald-600" />
            {meeting.members.length}{" "}
            {meeting.members.length === 1 ? "participant" : "participants"}
          </span>
        </div>
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-3 border-t border-zinc-100 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
          <Calendar className="shrink-0 opacity-70" size={14} strokeWidth={2} />
          {new Date(meeting.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>

        <Link
          href={`/group/${groupId}/${meetingid}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600"
        >
          Enter
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}
