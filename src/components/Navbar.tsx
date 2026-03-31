import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logout } from "@/app/actions";

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
    <nav className="flex items-center justify-between px-10 py-4 bg-white border-b border-zinc-200">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Thinktank
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {user ? (
          <>
            <span className="text-sm text-gray-500">
              Welcome, <span className="font-semibold text-black">{user.name}</span>
            </span>
            {/* Logout needs to be a form to trigger the Server Action */}
            <form action={logout}>
              <button className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition">
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-black transition">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}