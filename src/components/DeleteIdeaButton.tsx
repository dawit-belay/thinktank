"use client";
import { X } from "lucide-react"; // A small 'X' looks better for ideas
import { deleteIdea } from "@/app/actions";

export default function DeleteIdeaButton({ ideaId, meetingId, groupId }: { ideaId: string, meetingId: string, groupId: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Delete this idea?")) {
          await deleteIdea(ideaId, meetingId, groupId);
        }
      }}
      className="rounded-md bg-red-50 p-1.5 text-red-500 transition hover:bg-red-100"
      title="Delete Idea"
    >
      <X size={16} />
    </button>
  );
}