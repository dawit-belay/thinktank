"use client";
import { X } from "lucide-react"; // A small 'X' looks better for ideas
import { deleteIdea } from "@/app/actions";

export default function DeleteIdeaButton({ ideaId, meetingId }: { ideaId: string, meetingId: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Delete this idea?")) {
          await deleteIdea(ideaId, meetingId);
        }
      }}
      className="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded-md transition"
      title="Delete Idea"
    >
      <X size={16} />
    </button>
  );
}