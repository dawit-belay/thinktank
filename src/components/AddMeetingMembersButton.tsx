"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import {
  searchUsersForMeeting,
  inviteUserToMeeting,
  type SearchableUser,
} from "@/app/actions";

type Props = {
  meetingId: string;
  canManage: boolean;
};

export default function AddMeetingMembersButton({ meetingId, canManage }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
      const res = await searchUsersForMeeting(meetingId, debounced);
      if (!res.ok) {
        setSearchError(res.error ?? "Search failed.");
        setResults([]);
      } else {
        setResults(res.users);
      }
    } catch {
      setSearchError("Something went wrong.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [meetingId, debounced]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  const open = () => {
    setQuery("");
    setDebounced("");
    setResults([]);
    setSearchError(null);
    setMessage(null);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const onInvite = async (targetUserId: string) => {
    setInvitingId(targetUserId);
    setMessage(null);

    try {
      const res = await inviteUserToMeeting(meetingId, targetUserId);
      if (res.ok) {
        setMessage({ type: "ok", text: "User added to meeting." });
        setResults((prev) => prev.filter((u) => u.id !== targetUserId));
      } else {
        setMessage({ type: "err", text: res.error ?? "Could not add user." });
      }
    } catch {
      setMessage({ type: "err", text: "Could not add user." });
    } finally {
      setInvitingId(null);
    }
  };

  if (!canManage) return null;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
      >
        <UserPlus size={16} />
        Add meeting members
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white p-0 shadow-xl backdrop:bg-black/30"
      >
        <div className="border-b px-5 py-4">
          <h2 id={titleId} className="text-lg font-bold">Add members to meeting</h2>
          <p className="mt-1 text-sm text-zinc-500">Search group members by name or email.</p>
        </div>

        <div className="px-5 py-4">
          <input
            type="search"
            placeholder="Type at least 2 characters..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          {message && (
            <p className={`mt-2 text-sm ${message.type === "ok" ? "text-green-700" : "text-red-600"}`}>
              {message.text}
            </p>
          )}

          <div className="mt-3 min-h-[7rem]">
            {debounced.length > 0 && debounced.length < 2 && <p className="text-sm text-zinc-500">Keep typing...</p>}
            {loading && <p className="text-sm text-zinc-500">Searching...</p>}
            {searchError && <p className="text-sm text-red-600">{searchError}</p>}
            {!loading && !searchError && debounced.length >= 2 && results.length === 0 && (
              <p className="text-sm text-zinc-500">No eligible users found.</p>
            )}

            <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto">
              {results.map((u) => (
                <li key={u.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-xs text-zinc-500">{u.email}</p>
                  </div>
                  <button
                    type="button"
                    disabled={invitingId === u.id}
                    onClick={() => onInvite(u.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {invitingId === u.id ? "..." : "Invite"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end border-t px-5 py-3">
          <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm font-semibold">
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}