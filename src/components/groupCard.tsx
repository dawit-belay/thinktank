import Link from "next/link";
// import DeleteMeetingButton from "./DeleteMeetingButton";
import { Calendar, ArrowUpRight } from "lucide-react";

export default function GroupCard({ 
  group, 
//   isOwner 
}: { 
  group: { id: string; name: string; createdAt: Date | string }, 
//   isOwner: boolean 
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
          {/* {isOwner && <DeleteMeetingButton id={meeting.id} />} */}
        </div>
        <p className="mt-1 font-mono text-xs uppercase tracking-tighter text-zinc-400">
          ID: {group.id.slice(0, 8)}...
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4">
        <div className="flex gap-4 text-xs font-medium text-zinc-500">
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