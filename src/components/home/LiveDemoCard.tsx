"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Zap } from "lucide-react";

const SEED_IDEAS = [
  {
    id: 1,
    emoji: "🚀",
    text: "Launch the mobile app in Q3",
    author: "Sarah K.",
    initials: "SK",
    avatarClass: "bg-violet-100 text-violet-700",
    votes: 8,
    comments: 3,
  },
  {
    id: 2,
    emoji: "✨",
    text: "Redesign the onboarding flow",
    author: "Marcus T.",
    initials: "MT",
    avatarClass: "bg-emerald-100 text-emerald-700",
    votes: 12,
    comments: 5,
  },
  {
    id: 3,
    emoji: "🔗",
    text: "Integrate with Slack & Notion",
    author: "Priya M.",
    initials: "PM",
    avatarClass: "bg-amber-100 text-amber-700",
    votes: 7,
    comments: 2,
  },
];

export default function LiveDemoCard() {
  const [ideas, setIdeas] = useState(SEED_IDEAS);
  const [flashId, setFlashId] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const voteTimer = setInterval(() => {
      const idx = Math.floor(Math.random() * SEED_IDEAS.length);
      const id = SEED_IDEAS[idx].id;
      setFlashId(id);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id ? { ...idea, votes: idea.votes + 1 } : idea
        )
      );
      setTimeout(() => setFlashId(null), 650);
    }, 2400);

    const typingTimer = setInterval(() => {
      setTyping(true);
      setTimeout(() => setTyping(false), 1900);
    }, 4200);

    return () => {
      clearInterval(voteTimer);
      clearInterval(typingTimer);
    };
  }, []);

  const sorted = [...ideas].sort((a, b) => b.votes - a.votes);
  const topId = sorted[0].id;

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-3xl bg-emerald-400/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-xl shadow-zinc-200/70">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-zinc-700">Q2 Product Strategy</span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
            Live · Ideation
          </span>
        </div>

        {/* ideas list */}
        <div className="space-y-2 p-3">
          {sorted.map((idea) => (
            <div
              key={idea.id}
              className={`rounded-xl border p-3 transition-all duration-300 ${
                flashId === idea.id
                  ? "border-emerald-300 bg-emerald-50/80 shadow-sm"
                  : "border-zinc-100 bg-zinc-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm leading-snug text-zinc-800">
                  {idea.emoji} {idea.text}
                </p>
                {idea.id === topId && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    <Zap size={8} />
                    Top
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold ${idea.avatarClass}`}
                  >
                    {idea.initials}
                  </div>
                  <span className="text-[11px] text-zinc-400">{idea.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                    <MessageSquare size={10} />
                    {idea.comments}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold transition-all duration-300 ${
                      flashId === idea.id
                        ? "scale-110 border-emerald-400 bg-emerald-100 text-emerald-700"
                        : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    ▲ {idea.votes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* footer: typing or input hint */}
        <div className="border-t border-zinc-100 px-3 py-2.5">
          {typing ? (
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex gap-0.5">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    style={{ animationDelay: `${delay}ms` }}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400"
                  />
                ))}
              </span>
              Alex is typing…
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-400">
              💡 Share your idea…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
