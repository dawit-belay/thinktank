"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

type GroupMeetingsRealtimeProps = {
  groupId: string;
};

export default function GroupMeetingsRealtime({
  groupId,
}: GroupMeetingsRealtimeProps) {
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`group-meetings:${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "meetings",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const oldStage = (payload.old as { stage?: string } | null)?.stage;
          const newStage = (payload.new as { stage?: string } | null)?.stage;
          if (oldStage !== newStage) {
            router.refresh();
          }
        }
      );

    void channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, groupId, router]);

  return null;
}
