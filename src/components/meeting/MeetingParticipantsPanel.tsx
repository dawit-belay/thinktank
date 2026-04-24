"use client";

import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

type Member = {
    userId: string;
    role: "admin" | "member" | null;
    user: { name: string; email: string };
  };
  
  type Props = {
    members: Member[];
    meetingId: string;
    currentUserId?: string;
  };
  
  export default function MeetingParticipantsPanel({
    members,
    meetingId,
    currentUserId,
  }: Props) {
    const supabase = useSupabase();
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
      if (!supabase || !currentUserId) return;

      const channel = supabase.channel(`meeting-presence:${meetingId}`, {
        config: { presence: { key: currentUserId } },
      });

      const syncPresence = () => {
        const state = channel.presenceState();
        setOnlineUserIds(new Set(Object.keys(state)));
      };

      channel
        .on("presence", { event: "sync" }, syncPresence)
        .on("presence", { event: "join" }, syncPresence)
        .on("presence", { event: "leave" }, syncPresence)
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              userId: currentUserId,
              lastSeenAt: new Date().toISOString(),
            });
          }
        });

      return () => {
        void supabase.removeChannel(channel);
      };
    }, [supabase, meetingId, currentUserId]);

    const onlineCount = useMemo(
      () => members.filter((member) => onlineUserIds.has(member.userId)).length,
      [members, onlineUserIds]
    );

    return (
      <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm shadow-zinc-200/30">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">
            Participants
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              {onlineCount} online
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
              {members.length}
            </span>
          </div>
        </div>
        <ul className="mt-3 space-y-2">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{m.user.name}</p>
                <p className="text-xs text-zinc-500">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    onlineUserIds.has(m.userId)
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      onlineUserIds.has(m.userId) ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                  {onlineUserIds.has(m.userId) ? "online" : "offline"}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wide text-zinc-600">
                  {m.role ?? "member"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }