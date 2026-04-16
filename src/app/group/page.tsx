import { cookies } from "next/headers";
import { db } from "@/db";
import { groups,users } from "@/db/schema";
import { eq,desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, PlusCircle } from "lucide-react";

import GroupCard from "@/components/groupCard";

export default async function group() {
    // 1. Check for the cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // 2. Fetch the actual User object from Docker if the ID exists

  if (!userId) {
    redirect("/login");
  }

  // 2. Fetch the actual User object from Docker if the ID exists
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!currentUser) {
    redirect("/login");
  }

  // Fetch all meetings, newest first
  const allgroups = await db.query.groups.findMany({
    where:eq(groups.creatorId,userId),
    orderBy: [desc(groups.createdAt)],
    with: {
      meetings: true,
    },
  });
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-50/90 via-stone-50 to-zinc-100 px-5 pb-20 pt-10 text-zinc-900 md:px-8 md:pt-14">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-36 top-0 h-[30rem] w-[30rem] rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute right-0 top-20 h-[24rem] w-[24rem] rounded-full bg-sky-200/35 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              <Sparkles size={14} className="text-emerald-600" />
              Your Workspace
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              Welcome, {currentUser.name}
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              Manage your team spaces and jump into active collaboration rooms.
            </p>
          </div>

          <Link 
            href={`/group/create_new_group`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            <PlusCircle size={18} />
            Create new group
          </Link>
        </header>

        <section>
          <div className="mb-8 flex items-center gap-3">
            <div className="h-8 w-2 rounded-full bg-emerald-500" />
            <h2 className="text-2xl font-bold text-zinc-800 md:text-3xl">Active groups</h2>
          </div>

          {allgroups.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allgroups.map((group) => (
                <GroupCard 
                  key={group.id} 
                  group={group} 
                  // isOwner={group.creatorId === userId} 
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-emerald-200/80 bg-white/70 px-8 py-20 text-center shadow-sm shadow-zinc-200/30 backdrop-blur-sm">
              <p className="font-medium text-zinc-500">No groups found. Start one above!</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}