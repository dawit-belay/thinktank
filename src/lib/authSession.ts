import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/** If the session cookie matches a real user, send them away from auth screens. */
export async function redirectIfSignedIn() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return;

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (user) {
    redirect("/");
  }
}
