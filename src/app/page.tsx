import { cookies } from "next/headers";
import { createMeeting } from "./actions";
import { db } from "@/db";
import { meetings,users } from "@/db/schema";
import Link from "next/link";
import { eq } from "drizzle-orm";

import DeleteMeetingButton from "@/components/DeleteMeetingButton";

export default async function Home() {

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

  const allmeetings = await db.select().from(meetings);
  return (
    <main className="flex flex-col items-center min-h-screen p-24">

      {currentUser ? (
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentUser.name}!</h1>
          <p className="text-sm text-blue-600">Role: {currentUser.role}</p>
          {/* Show the Create Meeting form here */}
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Please Sign In</h1>
          <a href="/signup" className="text-blue-500 underline">Create an account to start brainstorming</a>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8 text-black">Thinktank Brainstroming Room</h1>
      <h1 className="mb-8 text-black">Start a new brainstorming session</h1>
      
      <form action={createMeeting} className="flex flex-col gap-4 w-full max-w-sm mb-12">
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
      <div className="w-full max-w-md border-t pt-8">
       <h2 className="text-xl font-semibold mb-4">Your Active Rooms</h2>
         <ul className="space-y-3">
           {allmeetings.map((meeting) => (
             <li key={meeting.id} className="relative group">
                <div className="flex items-center gap-2 border rounded-lg hover:border-blue-500 transition-colors shadow-sm">
                  <Link 
                      href={`/meeting/${meeting.id}`}
                      className="block p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <div className="font-medium">{meeting.title}</div>
                    <div className="text-xs text-gray-400 font-mono">{meeting.id}</div>
                  </Link>
                  <div className="pr-4">
                    <DeleteMeetingButton id={meeting.id} />
                  </div>
                </div>
              </li>
           ))}
         </ul>
         {allmeetings.length === 0 && (
           <p className="text-gray-500 italic">No meetings found. Be the first to add one!</p>
         )}
       </div>

    </main>
  );
}