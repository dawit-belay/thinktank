import { cookies } from "next/headers";
import { creategroup } from "../actions";
import { db } from "@/db";
import { groups,users } from "@/db/schema";
import { eq,desc } from "drizzle-orm";

import GroupCard from "@/components/groupCard";

export default async function group() {
    // 1. Check for the cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    // 2. Fetch the actual User object from Docker if the ID exists
  let currentUser = null;
  if (userId) {
    currentUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }

  // Fetch all meetings, newest first
  const allgroups = await db.query.groups.findMany({
    orderBy: [desc(groups.createdAt)],
  });
  return (
    <div className="min-h-screen bg-zinc-50 p-8 md:p-16 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h1 className="text-4xl font-black tracking-tight">Welcome, {currentUser.name}</h1>

        <form action={creategroup} className="flex flex-col gap-4 w-full max-w-sm mb-12 mt-4">
            <input 
            name="name" 
            placeholder="group name" 
            className="p-3 rounded bg-zinc-200 border border-zinc-700 text-black"
            required
            />
            <input 
            name="description" 
            placeholder="description" 
            className="p-3 rounded bg-zinc-200 border border-zinc-700 text-black"
            required
            />
            <button type="submit" className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-500 transition">
            Create group
            </button>
        </form>
      </div>
        

        <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-zinc-800">Active groups</h2>
            </div>

            {allgroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allgroups.map((group) => (
                  <GroupCard 
                    key={group.id} 
                    group={group} 
                    // isOwner={group.creatorId === userId} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
                <p className="text-zinc-400 font-medium">No groups found. Start one above!</p>
              </div>
            )}
        </section>
    </div>
    
  );
}