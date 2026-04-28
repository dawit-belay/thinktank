import Link from "next/link";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";

export default async function Navbar() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  let user = null;
  let userNotifications: {
    id: string;
    type: "group_invite" | "meeting_invite";
    message: string;
    link: string;
    isRead: boolean;
    createdAt: string;
  }[] = [];

  if (userId) {
    [user] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]);

    const rows = await db.query.notifications.findMany({
      where: eq(notifications.userId, userId),
      orderBy: [desc(notifications.createdAt)],
      limit: 20,
    });

    userNotifications = rows.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));
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
            <>
              <NotificationBell initialNotifications={userNotifications} />
              <ProfileDropdown userName={user.name} />
            </>
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