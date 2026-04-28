"use client";

import { useTransition } from "react";
import { toggleReaction, REACTION_EMOJIS } from "@/app/actions";

export type ReactionSummary = {
  emoji: string;
  label: string;
  count: number;
  hasReacted: boolean;
};

type Props = {
  ideaId: string;
  meetingId: string;
  groupId: string;
  reactions: ReactionSummary[];
  currentUserId?: string;
};

export default function ReactionPicker({
  ideaId,
  meetingId,
  groupId,
  reactions,
  currentUserId,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(emoji: string) {
    if (!currentUserId) return;
    startTransition(async () => {
      await toggleReaction(ideaId, emoji, meetingId, groupId);
    });
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-zinc-100 pt-2.5">
      {reactions.map(({ emoji, label, count, hasReacted }) => (
        <button
          key={emoji}
          onClick={() => handleToggle(emoji)}
          disabled={!currentUserId || isPending}
          title={label}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition disabled:cursor-default ${
            hasReacted
              ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-700 hover:bg-emerald-100"
              : count > 0
              ? "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100"
              : "border-zinc-100 bg-transparent text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-600"
          }`}
        >
          <span>{emoji}</span>
          {count > 0 && <span>{count}</span>}
        </button>
      ))}
    </div>
  );
}
