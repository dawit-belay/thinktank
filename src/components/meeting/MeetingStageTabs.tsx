"use client";

import { updateMeetingStage } from "@/app/actions";
import { useRouter } from "next/navigation";

type Stage = "ideation" | "decision" | "summary";

export default function MeetingStageTabs({
  meetingId,
  groupId,
  currentStage,
  canManage,
}: {
  meetingId: string;
  groupId: string;
  currentStage: Stage;
  canManage: boolean;
}) {
  const router = useRouter();

  const setStage = async (stage: Stage) => {
    const res = await updateMeetingStage(meetingId, stage, groupId);
    if (!res.ok) {
      alert(res.error ?? "Failed to change stage.");
      return;
    }
    router.refresh();
  };

  const stages: Stage[] = ["ideation", "decision", "summary"];

  return (
    <div className="inline-flex flex-wrap items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-1.5">
      {stages.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!canManage}
          onClick={() => setStage(s)}
          className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold capitalize transition ${
            currentStage === s
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
              : "bg-white text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}