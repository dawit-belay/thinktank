"use client";

import { useState } from "react";
import { logout } from "@/app/actions";

export default function ProfileDropdown({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
      >
        <span className="max-w-36 truncate font-semibold text-zinc-800">
          {userName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
          <form action={logout}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50">
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}