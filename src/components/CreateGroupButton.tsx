"use client";

import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle } from "lucide-react";
import { creategroup } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create group"}
    </button>
  );
}

export default function CreateGroupButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = () => {
    dialogRef.current?.showModal();
  };

  const close = () => {
    dialogRef.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
      >
        <PlusCircle size={18} />
        Create new group
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === dialogRef.current) {
            close();
          }
        }}
        className="fixed inset-0 z-50 m-auto h-fit w-[min(32rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl shadow-zinc-400/30 backdrop:bg-zinc-900/25 backdrop:backdrop-blur-sm"
      >
        <div className="border-b border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-5">
          <h2 id={titleId} className="text-2xl font-bold tracking-tight text-zinc-900">
            Create a new group
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Start a shared workspace for your team and invite people after it is created.
          </p>
        </div>

        <form action={creategroup} className="px-6 py-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="mb-2 block text-sm font-semibold text-zinc-700">
                Group name
              </label>
              <input
                id="group-name"
                name="name"
                placeholder="Thinktank product team"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label htmlFor="group-description" className="mb-2 block text-sm font-semibold text-zinc-700">
                Description
              </label>
              <textarea
                id="group-description"
                name="description"
                placeholder="What is this workspace for?"
                rows={4}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                required
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={close}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </dialog>
    </>
  );
}
