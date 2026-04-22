"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

type MeetingIdeasRealtimeProps = {
  meetingId: string;
  /** Idea ids in this meeting; used to scope vote events to this room only. */
  ideaIds: string[];
};

/**
 * Subscribes to Postgres changes for this meeting's ideas and related votes, then
 * refreshes the server-rendered meeting page so Drizzle data stays the source of truth.
 */
export default function MeetingIdeasRealtime({
  meetingId,
  ideaIds,
}: MeetingIdeasRealtimeProps) {
  const supabase = useSupabase();
  const router = useRouter();

  const voteFilter = useMemo(() => {
    if (ideaIds.length === 0) return null;
    return `idea_id=in.(${ideaIds.join(",")})`;
  }, [ideaIds]);

  useEffect(() => {
    if (!supabase) return;

    const ideasFilter = `meeting_id=eq.${meetingId}`;

    const channel = supabase.channel(`meeting:${meetingId}`).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ideas",
        filter: ideasFilter,
      },
      () => {
        router.refresh();
      }
    );

    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "meetings",
        filter: `id=eq.${meetingId}`,
      },
      (payload) => {
        const oldStage = (payload.old as { stage?: string } | null)?.stage;
        const newStage = (payload.new as { stage?: string } | null)?.stage;
        if (oldStage !== newStage) {
          router.refresh();
        }
      }
    );

    if (voteFilter) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: voteFilter,
        },
        () => {
          router.refresh();
        }
      );
    }

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, meetingId, router, voteFilter]);

  return null;
}
