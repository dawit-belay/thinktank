"use client";
import { X } from "lucide-react"; // A small 'X' looks better for ideas
import { deleteIdea } from "@/app/actions";
import { useRouter } from "next/navigation";

export default function DeleteIdeaButton({ ideaId, meetingId, groupId }: { ideaId: string, meetingId: string, groupId: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Delete this idea?")) {
          const result = await deleteIdea(ideaId, meetingId, groupId);
          if (!result.ok) {
            alert(result.error ?? "Delete failed.");
            return;
          }
          router.refresh();
        }
      }}
      className="rounded-md bg-red-50 p-1.5 text-red-500 transition hover:bg-red-100"
      title="Delete Idea"
    >
      <X size={16} />
    </button>
  );
}