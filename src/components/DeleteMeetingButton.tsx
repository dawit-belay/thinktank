"use client"; // This tells Next.js this is a browser-side component

import { Trash2 } from "lucide-react"; // Import the Trash icon
import { deleteMeeting } from "@/app/actions";

interface Props {
  id: string;
  groupId: string;
}

export default function DeleteMeetingButton({ id,groupId }: Props) {
  return (
    <button
      onClick={async (e) => {
        e.preventDefault(); // Stop the <Link> from triggering
        if (confirm("Are you sure you want to delete this room?")) {
          await deleteMeeting(id,groupId);
        }
      }}
      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      title="Delete Room"
    >
      <Trash2 size={18} />
    </button>
  );
}