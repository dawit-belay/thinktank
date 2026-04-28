"use client";

import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { Search, X, Lightbulb, CalendarDays, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch, type SearchResults } from "@/app/actions";

function truncate(text: string, max = 80) {
  return text.length <= max ? text : text.slice(0, max) + "…";
}

const STAGE_LABEL: Record<string, string> = {
  ideation: "Ideation",
  decision: "Decision",
  summary: "Summary",
};

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const hasResults =
    results && (results.ideas.length > 0 || results.meetings.length > 0);
  const showEmpty =
    results && !hasResults && query.trim().length >= 2 && !isPending;

  function openSearch() {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    setResults(null);
  }

  const runSearch = useCallback(
    (q: string) => {
      startTransition(async () => {
        const res = await globalSearch(q);
        setResults(res);
      });
    },
    []
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(q), 300);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") closeSearch();
  }

  function navigate(href: string) {
    closeSearch();
    router.push(href);
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        closeSearch();
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {!isOpen ? (
        <button
          onClick={openSearch}
          className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 shadow-sm ring-2 ring-emerald-500/20 w-64">
          {isPending ? (
            <Loader2 size={15} className="shrink-0 animate-spin text-zinc-400" />
          ) : (
            <Search size={15} className="shrink-0 text-zinc-400" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search ideas and meetings…"
            className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
          />
          <button onClick={closeSearch} className="text-zinc-400 hover:text-zinc-700">
            <X size={14} />
          </button>
        </div>
      )}

      {isOpen && (query.trim().length >= 2) && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-200/60">
          {showEmpty && (
            <p className="px-4 py-6 text-center text-sm text-zinc-400">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {hasResults && (
            <div className="max-h-80 overflow-y-auto">
              {results!.ideas.length > 0 && (
                <div>
                  <p className="sticky top-0 bg-zinc-50 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Ideas
                  </p>
                  {results!.ideas.map((idea) => (
                    <button
                      key={idea.id}
                      onClick={() =>
                        navigate(`/group/${idea.groupId}/${idea.meetingId}`)
                      }
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-zinc-50"
                    >
                      <Lightbulb
                        size={14}
                        className="mt-0.5 shrink-0 text-amber-500"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm text-zinc-800">
                          {truncate(idea.content)}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                          {idea.meetingTitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results!.meetings.length > 0 && (
                <div>
                  <p className="sticky top-0 bg-zinc-50 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Meetings
                  </p>
                  {results!.meetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() =>
                        navigate(`/group/${meeting.groupId}/${meeting.id}`)
                      }
                      className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition hover:bg-zinc-50"
                    >
                      <CalendarDays
                        size={14}
                        className="mt-0.5 shrink-0 text-sky-500"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-800">
                          {meeting.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="text-[11px] text-zinc-400">
                            {STAGE_LABEL[meeting.stage]}
                          </span>
                          {meeting.snippet && (
                            <>
                              <span className="text-zinc-300">·</span>
                              <span className="truncate text-[11px] text-zinc-400">
                                {truncate(meeting.snippet, 50)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
