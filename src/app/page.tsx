import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq} from "drizzle-orm";
import Link from "next/link";

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

  return (
    <div>
      <div>
            {currentUser ? (
              <div>
                <h1 className="text-4xl font-black tracking-tight">Welcome, {currentUser.name}</h1>
                <p className="text-zinc-500 font-medium mt-1">Ready to solve some problems today?</p>
                <Link href="/meeting" className="text-blue-500 hover:underline">Meeting</Link>
              </div>
            ) : (
              <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight tracking-tight">Thinktank</h1>
                <p className="text-zinc-500 font-medium">Please <a href="/login" className="text-blue-600 underline">Sign In</a> to create rooms.</p>
              </div>
            )}
          </div>
    </div>
  );
}