import { cookies } from "next/headers";
import { createMeeting } from "../../actions";
import { db } from "@/db";
import { meetings,users,ideas } from "@/db/schema";
import Link from "next/link";
import { eq,desc,count } from "drizzle-orm";

import MeetingCard from "@/components/MeetingCard";
import DeleteMeetingButton from "@/components/DeleteMeetingButton";

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

  // 1. Get Meetings count
const [myMeetingsCount] = await db
  .select({ count: count() })
  .from(meetings)
  .where(eq(meetings.creatorId, userId!));

// 2. Get your total Ideas contributed
const [myIdeasCount] = await db
  .select({ count: count() })
  .from(ideas)
  .where(eq(ideas.authorId, userId!));

// 3. Get your "Karma" (Sum of votes on your ideas)
const myIdeas = await db.query.ideas.findMany({
  where: eq(ideas.authorId, userId!),
  with: { votes: true }
});
const totalKarma = myIdeas.reduce((acc, idea) => acc + idea.votes.length, 0);

  // Fetch all meetings, newest first
  const allmeetings = await db.query.meetings.findMany({
    where: eq(meetings.groupId, groupId),
    orderBy: [desc(meetings.createdAt)],
  });

  return (
    <main className="min-h-screen bg-zinc-50 p-8 md:p-16 text-black">
      <div className="max-w-6xl mx-auto">
     
        {/* --- 1. HEADER & WELCOME SECTION --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            {currentUser ? (
              <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome, {currentUser.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 mt-6">
                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Rooms Created</p>
                    <p className="text-3xl font-black text-blue-600">{myMeetingsCount.count}</p>
                  </div>
                  
                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Ideas Shared</p>
                    <p className="text-3xl font-black text-green-600">{myIdeasCount.count}</p>
                  </div>

                  <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Karma</p>
                    <p className="text-3xl font-black text-orange-500">+{totalKarma}</p>
                  </div>
                </div>
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
        
        <hr className="border-zinc-200 mb-12" />

          {/* --- 3. THE DASHBOARD GRID --- */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-zinc-800">Active Brainstorming Rooms</h2>
            </div>

            {allmeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allmeetings.map((meeting) => (
                  <MeetingCard 
                    key={meeting.id} 
                    meeting={meeting} 
                    isOwner={meeting.creatorId === userId} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white border-2 border-dashed border-zinc-200 rounded-3xl">
                <p className="text-zinc-400 font-medium">No meetings found. Start one above!</p>
              </div>
            )}
          </section>
        </div>
    </main>
  );
}