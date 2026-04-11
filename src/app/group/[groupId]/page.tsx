import { cookies } from "next/headers";
import { createMeeting } from "../../actions";
import { db } from "@/db";
import { meetings,users,ideas } from "@/db/schema";
import Link from "next/link";
import { eq,desc,count } from "drizzle-orm";

import MeetingCard from "@/components/MeetingCard";

interface GroupPageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: GroupPageProps) {

  const { groupId } = await params;
  console.log("groupId:", groupId);
  // 1. Check for the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    throw new Error("Unauthorized"); // should never happen
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId!),
  });

  if (!currentUser) {
    throw new Error("User not found");
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
        <div className="flex flex-col mb-12 gap-2">
            <div className="flex flex-col gap-1 md:flex-row justify-between max-w-3xl">
              <h1 className="text-4xl font-black tracking-tight">Welcome, {currentUser.name}</h1>
              <Link 
                href={`/group/${groupId}/create_new_meeting`}
                className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all w-[165px]"
              >
                create new meeting
              </Link>
              <Link 
                href={`#`}
                className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all w-[150px]"
              >
                add members
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 mt-6">
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
        
        <hr className="border-zinc-200 mb-12" />

          {/* --- 3. THE DASHBOARD GRID --- */}
          <section>
              <h2 className="text-2xl font-bold text-zinc-800 mb-8">Active Brainstorming Rooms</h2>

            {allmeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allmeetings.map((meeting) => (
                  <MeetingCard 
                    key={meeting.id}
                    groupId={groupId} 
                    meetingid={meeting.id} 
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