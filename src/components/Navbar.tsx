import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProfileDropdown from "./ProfileDropdown"

export default async function Navbar() {
  // 1. Check if the user is logged in via cookies
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 2. Fetch the user's name from Docker if they are logged in
  let user = null;
  if (userId) {
    user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 px-5 py-3 backdrop-blur-md md:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3.5 py-1.5 text-base font-semibold tracking-tight text-white transition hover:bg-zinc-700"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Thinktank
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {user ? (
            <ProfileDropdown userName={user.name} />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}