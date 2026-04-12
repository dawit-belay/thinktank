"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import {
  inviteUserToGroup,
  searchUsersForGroup,
  type SearchableUser,
} from "@/app/actions";

type Props = {
  groupId: string;
  canManage: boolean;
};

export default function AddMembersButton({ groupId, canManage }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [inviteMessage, setInviteMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async () => {
    if (debounced.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await searchUsersForGroup(groupId, debounced);
      if (!res.ok) {
        setSearchError(res.error ?? "Search failed.");
        setResults([]);
        return;
      }
      setResults(res.users ?? []);
    } catch {
      setSearchError("Something went wrong.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [groupId, debounced]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const open = () => {
    setQuery("");
    setDebounced("");
    setResults([]);
    setSearchError(null);
    setInviteMessage(null);
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  const onInvite = async (targetUserId: string) => {
    setInvitingId(targetUserId);
    setInviteMessage(null);
    try {
      const res = await inviteUserToGroup(groupId, targetUserId);
      if (res.ok) {
        setInviteMessage({ type: "ok", text: "Added to the group." });
        setResults((prev) => prev.filter((u) => u.id !== targetUserId));
      } else {
        setInviteMessage({
          type: "err",
          text: res.error ?? "Could not add member.",
        });
      }
    } catch {
      setInviteMessage({ type: "err", text: "Could not add member." });
    } finally {
      setInvitingId(null);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white/95 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-emerald-800 shadow-sm shadow-zinc-200/50 backdrop-blur-sm transition hover:border-emerald-400 hover:bg-emerald-50 sm:w-auto"
      >
        <UserPlus size={18} strokeWidth={2.25} />
        Add members
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 m-auto h-fit max-h-[min(90vh,32rem)] w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl shadow-zinc-400/30 backdrop:bg-zinc-900/25 backdrop:backdrop-blur-sm"
      >
        <div className="border-b border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-zinc-900">
            Add members
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Search by name or email. Invites add people to this group right away.
          </p>
        </div>

        <div className="px-5 py-4">
          <label className="sr-only" htmlFor="member-search">
            Search users
          </label>
          <input
            id="member-search"
            type="search"
            autoComplete="off"
            placeholder="Type at least 2 characters…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none ring-0 transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
          />

          {inviteMessage && (
            <p
              className={`mt-2 text-sm ${
                inviteMessage.type === "ok"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {inviteMessage.text}
            </p>
          )}

          <div className="mt-3 min-h-[8rem]">
            {debounced.length > 0 && debounced.length < 2 && (
              <p className="text-sm text-zinc-500">Keep typing…</p>
            )}
            {loading && (
              <p className="text-sm text-zinc-500">Searching…</p>
            )}
            {searchError && (
              <p className="text-sm text-red-600">{searchError}</p>
            )}
            {!loading &&
              !searchError &&
              debounced.length >= 2 &&
              results.length === 0 && (
                <p className="text-sm text-zinc-500">No users found.</p>
              )}
            <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
              {results.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={invitingId === u.id}
                    onClick={() => onInvite(u.id)}
                    className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {invitingId === u.id ? "…" : "Invite"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end border-t border-zinc-100 bg-zinc-50/50 px-5 py-3">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
