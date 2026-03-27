import { submitIdea } from "./actions";
import { db } from "@/db";
import { ideas } from "@/db/schema";

export default async function TestPage() {
  // Fetch existing ideas from Docker to show them on the page
  const allIdeas = await db.select().from(ideas);

  return (
    <main className="p-10 font-sans">
      <h1 className="text-2xl font-bold mb-4">Synapse Connection Test</h1>
      
      {/* To fix the Type error, we ensure the action doesn't return 
          the object directly to the form's action attribute.
      */}
      <form 
        action={async (formData) => {
          "use server";
          await submitIdea(formData);
        }} 
        className="flex gap-2 mb-8"
      >
        <input 
          name="content" 
          placeholder="Type a brainstorm idea..." 
          className="border p-2 rounded text-black"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send to Docker DB
        </button>
      </form>

      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold">Stored Ideas in Postgres:</h2>
        <ul className="list-disc ml-5 mt-2">
          {allIdeas.map((idea) => (
            <li key={idea.id}>{idea.content}</li>
          ))}
        </ul>
        {allIdeas.length === 0 && (
          <p className="text-gray-500 italic">No ideas found. Be the first to add one!</p>
        )}
      </div>
    </main>
  );
}