import { createMeeting } from "./actions";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import Link from "next/link";

import DeleteMeetingButton from "@/components/DeleteMeetingButton";

export default async function Home() {
  const allmeetings = await db.select().from(meetings);
  return (
    <main className="flex flex-col items-center min-h-screen p-24">
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





// import { submitIdea } from "./actions";
// import { db } from "@/db";
// import { ideas } from "@/db/schema";

// export default async function TestPage() {
//   // Fetch existing ideas from Docker to show them on the page
//   const allIdeas = await db.select().from(ideas);

//   return (
//     <main className="p-10 font-sans">
//       <h1 className="text-2xl font-bold mb-4">Synapse Connection Test</h1>
      
//       {/* To fix the Type error, we ensure the action doesn't return 
//           the object directly to the form's action attribute.
//       */}
//       <form 
//         action={async (formData) => {
//           "use server";
//           await submitIdea(formData);
//         }} 
//         className="flex gap-2 mb-8"
//       >
//         <input 
//           name="content" 
//           placeholder="Type a brainstorm idea..." 
//           className="border p-2 rounded text-black"
//           required
//         />
//         <button 
//           type="submit" 
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Send to Docker DB
//         </button>
//       </form>

//       <div className="border-t pt-4">
//         <h2 className="text-lg font-semibold">Stored Ideas in Postgres:</h2>
//         <ul className="list-disc ml-5 mt-2">
//           {allIdeas.map((idea) => (
//             <li key={idea.id}>{idea.content}</li>
//           ))}
//         </ul>
//         {allIdeas.length === 0 && (
//           <p className="text-gray-500 italic">No ideas found. Be the first to add one!</p>
//         )}
//       </div>
//     </main>
//   );
// }