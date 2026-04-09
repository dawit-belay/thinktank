"use client";

import { useState } from "react";
import { logout } from "@/app/actions";

export default function ProfileDropdown({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
      >
        <span className="font-semibold text-black">{userName}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <form action={logout}>
            <button className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition">
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  );
}