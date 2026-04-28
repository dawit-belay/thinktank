"use client";

import { useState, useTransition } from "react";
import { CheckSquare, Square, Trash2, Plus, X, CalendarDays, ListChecks } from "lucide-react";
import { createActionItem, deleteActionItem, toggleActionItemStatus } from "@/app/actions";

export type ActionItemData = {
  id: string;
  content: string;
  status: "open" | "done";
  assigneeId: string;
  assigneeName: string;
  dueDate: string | null;
};

export type MemberOption = {
  userId: string;
  userName: string;
};

type Props = {
  meetingId: string;
  groupId: string;
  initialItems: ActionItemData[];
  members: MemberOption[];
  currentUserId?: string;
  canManage: boolean;
};

export default function ActionItemsPanel({
  meetingId,
  groupId,
  initialItems,
  members,
  currentUserId,
  canManage,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const doneCount = initialItems.filter((i) => i.status === "done").length;

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("meetingId", meetingId);
    fd.set("groupId", groupId);
    const form = e.currentTarget;
    startTransition(async () => {
      const res = await createActionItem(fd);
      if (res.ok) {
        form.reset();
        setShowForm(false);
      }
    });
  }

  function handleToggle(itemId: string) {
    startTransition(async () => {
      await toggleActionItemStatus(itemId, meetingId, groupId);
    });
  }

  function handleDelete(itemId: string) {
    startTransition(async () => {
      await deleteActionItem(itemId, meetingId, groupId);
    });
  }

  function formatDue(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const isPast = (iso: string) => new Date(iso) < new Date();

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm shadow-zinc-200/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-emerald-600" />
          <h3 className="font-bold text-zinc-900">Action Items</h3>
          {initialItems.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500">
              {doneCount}/{initialItems.length}
            </span>
          )}
        </div>
        {canManage && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600"
          >
            <Plus size={13} />
            Add
          </button>
        )}
      </div>

      {initialItems.length === 0 && !showForm && (
        <p className="mt-3 text-xs text-zinc-400">
          No action items yet.{canManage ? " Add one to track who does what." : ""}
        </p>
      )}

      {initialItems.length > 0 && (
        <ul className="mt-3 space-y-2">
          {initialItems.map((item) => {
            const canToggle = item.assigneeId === currentUserId || canManage;
            const canDelete = canManage;
            const overdue = item.status === "open" && item.dueDate && isPast(item.dueDate);

            return (
              <li
                key={item.id}
                className={`flex items-start gap-2.5 rounded-xl border p-3 transition ${
                  item.status === "done"
                    ? "border-zinc-100 bg-zinc-50/60"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <button
                  onClick={() => canToggle && handleToggle(item.id)}
                  disabled={!canToggle || isPending}
                  className={`mt-0.5 shrink-0 transition ${
                    canToggle ? "hover:text-emerald-600" : "cursor-default"
                  } ${item.status === "done" ? "text-emerald-500" : "text-zinc-300"}`}
                >
                  {item.status === "done" ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${
                      item.status === "done"
                        ? "text-zinc-400 line-through"
                        : "text-zinc-800"
                    }`}
                  >
                    {item.content}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-bold text-zinc-600">
                        {item.assigneeName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] text-zinc-500">{item.assigneeName}</span>
                    </div>
                    {item.dueDate && (
                      <div
                        className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          overdue
                            ? "bg-red-50 text-red-500"
                            : item.status === "done"
                            ? "bg-zinc-100 text-zinc-400"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <CalendarDays size={9} />
                        {formatDue(item.dueDate)}
                      </div>
                    )}
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="mt-0.5 shrink-0 text-zinc-300 transition hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showForm && canManage && (
        <form onSubmit={handleCreate} className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
          <input
            name="content"
            placeholder="Describe the action item…"
            required
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20"
          />

          <div className="flex gap-2">
            <select
              name="assigneeId"
              required
              defaultValue=""
              className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
            >
              <option value="" disabled>Assign to…</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userName}
                </option>
              ))}
            </select>

            <input
              name="dueDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-emerald-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-emerald-500 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-500 transition hover:text-zinc-700"
            >
              <X size={14} />
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
