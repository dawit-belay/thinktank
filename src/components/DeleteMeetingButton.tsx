"use client"; // This tells Next.js this is a browser-side component

import { Trash2 } from "lucide-react"; // Import the Trash icon
import { deleteMeeting } from "@/app/actions";

interface Props {
  id: string;
  groupId: string;
  /** Use "dark" on glass/dark cards (e.g. group hub). Default matches light pages. */
  variant?: "light" | "dark";
}

export default function DeleteMeetingButton({
  id,
  groupId,
  variant = "light",
}: Props) {
  const styles =
    variant === "dark"
      ? "p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
      : "p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors";
  return (
    <button
      onClick={async (e) => {
        e.preventDefault(); // Stop the <Link> from triggering
        if (confirm("Are you sure you want to delete this room?")) {
          await deleteMeeting(id,groupId);
        }
      }}
      className={styles}
      title="Delete Room"
    >
      <Trash2 size={18} />
    </button>
  );
}