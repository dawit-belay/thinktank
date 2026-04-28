"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Search, X } from "lucide-react";

type Props = {
  groupId: string;
  initialQuery: string;
};

export default function DecisionSearch({ groupId, initialQuery }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    const url = q
      ? `/group/${groupId}/decisions?q=${encodeURIComponent(q)}`
      : `/group/${groupId}/decisions`;
    router.push(url);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    router.push(`/group/${groupId}/decisions`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          ref={inputRef}
          name="q"
          defaultValue={initialQuery}
          placeholder="Filter by keyword…"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-9 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
        />
        {initialQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
      >
        Search
      </button>
    </form>
  );
}
