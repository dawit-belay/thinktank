"use client";
import { toggleVote } from "@/app/actions";

export default function VoteButton({ 
  ideaId, 
  meetingId, 
  count, 
  hasVoted 
}: { 
  ideaId: string, 
  meetingId: string, 
  count: number, 
  hasVoted: boolean 
}) {
  return (
    <button 
      onClick={() => toggleVote(ideaId, meetingId)}
      className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
        hasVoted 
          ? "bg-blue-600 text-white border-blue-600" 
          : "bg-white text-gray-500 border-gray-200 hover:border-blue-400"
      }`}
    >
      <span>{hasVoted ? "▲" : "△"}</span>
      <span className="font-bold text-sm">{count}</span>
    </button>
  );
}