"use client";
import { useState } from "react";
import { saveMeetingDecision } from "@/app/actions";
import { useRouter } from "next/navigation";

export function DecisionPanel({
  meetingId, groupId, initialDecision, canManage,
}: {
  meetingId: string; groupId: string; initialDecision: string; canManage: boolean;
}) {
  const [value, setValue] = useState(initialDecision ?? "");
  const router = useRouter();

  const onSave = async () => {
    const res = await saveMeetingDecision(meetingId, groupId, value);
    if (!res.ok) return alert(res.error ?? "Failed");
    router.refresh();
  };

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm shadow-zinc-200/30">
      <h3 className="font-bold text-zinc-900">Decision</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Capture the final choice and why the team selected it.
      </p>
      <textarea
        className="mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
        rows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!canManage}
        placeholder="Write the final decision..."
      />
      {canManage && (
        <button className="mt-3 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600" onClick={onSave}>
          Save Decision
        </button>
      )}
    </section>
  );
}