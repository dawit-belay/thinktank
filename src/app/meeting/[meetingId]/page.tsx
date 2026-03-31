import { db } from "@/db";
import { meetings,ideas,users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { submitIdea } from "@/app/actions";

interface MeetingPageProps {
  params: Promise<{ meetingId: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId } = await params;

  // Fetch the specific meeting from Docker
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) {
    notFound(); // Shows the 404 page if the ID doesn't exist
  }

  // We select from 'ideas', then join 'users' where the IDs match
  const meetingIdeas = await db
    .select({
      id: ideas.id,
      content: ideas.content,
      createdAt: ideas.createdAt,
      authorName: users.name, // We "pluck" the name from the users table
      authorEmail: users.email,
    })
    .from(ideas)
    .innerJoin(users, eq(ideas.authorId, users.id)) // The "Stitch" point
    .where(eq(ideas.meetingId, meetingId))
    .orderBy(desc(ideas.createdAt));

  return (
   <main className="p-10 max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">{meeting.title}</h1>
        <p className="text-gray-500 font-mono text-sm">Room ID: {meetingId}</p>
      </div>

      {/* 3. The Submit Idea Form */}
      <form action={submitIdea} className="mb-10 flex gap-2">
        {/* WE NEED A HIDDEN INPUT TO SEND THE MEETING ID */}
        <input type="hidden" name="meetingId" value={meetingId} />
        
        <input 
          name="content" 
          placeholder="Type a new idea..." 
          className="flex-grow p-3 border rounded-lg bg-white text-black"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
          Add Idea
        </button>
      </form>

      {/* 4. The Ideas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetingIdeas.map((idea) => (
          <div key={idea.id} className="p-4 border rounded-xl shadow-sm bg-yellow-50 border-yellow-200">
            <p className="text-gray-800">{idea.content}</p>

            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                {idea.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{idea.authorName}</p>
                <p className="text-[10px] text-gray-400 uppercase">Contributor</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}