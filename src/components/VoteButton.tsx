"use client";
import { toggleVote } from "@/app/actions";

export default function VoteButton({ 
  ideaId, 
  meetingId, 
  groupId, 
  count, 
  hasVoted 
}: { 
  ideaId: string, 
  meetingId: string, 
  groupId: string, 
  count: number, 
  hasVoted: boolean 
}) {
  return (
    <button 
      onClick={() => toggleVote(ideaId, meetingId, groupId)}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all ${
        hasVoted 
          ? "border-emerald-600 bg-emerald-600 text-white" 
          : "border-zinc-200 bg-white text-zinc-500 hover:border-emerald-400 hover:text-emerald-700"
      }`}
    >
      <span>{hasVoted ? "▲" : "△"}</span>
      <span className="font-bold text-sm">{count}</span>
    </button>
  );
}