import Link from "next/link";
// import DeleteMeetingButton from "./DeleteMeetingButton";
import { Calendar, ArrowUpRight, DoorOpen } from "lucide-react";

export default function GroupCard({ 
  group, 
  isAdmin,
}: { 
  group: {
    id: string;
    name: string;
    description?: string | null;
    createdAt: Date | string;
    meetings: { id: string }[];
  }, 
  isAdmin: boolean;
}) {
  return (
    <div className="group/card relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-6 shadow-md shadow-zinc-200/50 transition-all duration-300 hover:border-emerald-300/80 hover:shadow-lg hover:shadow-emerald-500/10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl transition-opacity group-hover/card:opacity-100"
      />
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-zinc-900 transition-colors group-hover/card:text-emerald-700">
            {group.name}
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
        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
          {group.description?.trim() || "A shared workspace for brainstorming and collaboration."}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4">
        <div className="flex gap-4 text-xs font-medium text-zinc-500">
           <span className="flex items-center gap-1.5">
             <DoorOpen size={14} />
             {group.meetings.length} {group.meetings.length === 1 ? "room" : "rooms"}
           </span>
           <span className="flex items-center gap-1.5">
             <Calendar size={14} />
             {new Date(group.createdAt).toLocaleDateString()}
           </span>
        </div>
        
        <Link 
          href={`/group/${group.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-600"
        >
          Join group
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </Link>
      </div>
    </div>
  );
}