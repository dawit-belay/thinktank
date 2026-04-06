import Link from "next/link";
import DeleteMeetingButton from "./DeleteMeetingButton";
import { Users, Calendar } from "lucide-react";

export default function MeetingCard({ 
  meeting, 
  isOwner 
}: { 
  meeting: any, 
  isOwner: boolean 
}) {
  return (
    <div className="group relative p-6 bg-white border border-zinc-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between h-48">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
            {meeting.title}
          </h3>
          {isOwner && <DeleteMeetingButton id={meeting.id} />}
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-1 uppercase tracking-tighter">
          ID: {meeting.id.slice(0, 8)}...
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex gap-4 text-zinc-400 text-xs font-medium">
           <span className="flex items-center gap-1">
             <Calendar size={14} /> 
             {new Date(meeting.createdAt).toLocaleDateString()}
           </span>
        </div>
        
        <Link 
          href={`/meeting/${meeting.id}`}
          className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all"
        >
          Join Room
        </Link>
      </div>
    </div>
  );
}