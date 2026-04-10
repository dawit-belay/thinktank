import { cookies } from "next/headers";
import { creategroup } from "../../actions";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq} from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function CreateNewGroup() {
    // 1. Check for the cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

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

  return (
      <div className="flex flex-col items-center mt-6">
        <h1 className="text-4xl font-black tracking-tight">creat a new group</h1>

        <form action={creategroup} className="flex flex-col justify-center gap-4 w-full max-w-sm mb-12 mt-4">
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
  );
}