"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function useSupabase(): SupabaseClient | null {
  return useContext(SupabaseContext);
}

export default function SupabaseProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
      return null;
    }
    return createClient(url, key);
  }, []);

  return (
    <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>
  );
}
