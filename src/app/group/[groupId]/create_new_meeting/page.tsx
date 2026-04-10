import { cookies } from "next/headers";
import { createMeeting } from "../../../actions";
import { db } from "@/db";
import { users } from "@/db/schema";
import Link from "next/link";
import { eq } from "drizzle-orm";


interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {

  const { groupId } = await params;
  console.log("groupId:", groupId);
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


  return (
    <main className="min-h-screen bg-zinc-50 p-8 md:p-16 text-black">
      <div className="max-w-6xl mx-auto">
     
        {/* --- 1. HEADER & WELCOME SECTION --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            {currentUser ? (
              <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome, {currentUser.name}</h1>
                <p className="text-zinc-500 font-medium mt-1">Ready to solve some problems today?</p>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-2xl font-bold">Please Sign In</h1>
                <a href="/signup" className="text-blue-500 underline">Create an account to start brainstorming</a>
                {/* new update ----- to be used */}
                {/* <h1 className="text-4xl font-black tracking-tight tracking-tight">Thinktank</h1>
                <p className="text-zinc-500 font-medium">Please <a href="/signup" className="text-blue-600 underline">Sign In</a> to create rooms.</p> */}
              </div>
            )}
          </div>
          
          {currentUser && (
            <form action={createMeeting} className="flex flex-col gap-4 w-full max-w-sm mb-12">
              <input type="hidden" name="groupId" value={groupId} />
              <input 
                name="title" 
                placeholder="Meeting Title (e.g. Q3 Planning)" 
                className="p-3 rounded bg-zinc-200 border border-zinc-700 text-black"
                required
              />
              <button type="submit" className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-500 transition">
                Create Meeting Room
              </button>
            </form>
          )}
        </header>
        </div>
    </main>
  );
}