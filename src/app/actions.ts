"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas, meetings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function signUp(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Hash the password (10 rounds of scrambling)
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Insert into Docker
  const [newUser] = await db.insert(users).values({
    name, email, password: hashedPassword,
    role: "user", // Default role
  }).returning();

  // 3. Set a Cookie (This "Logs them in" instantly)
  const cookieStore = await cookies();
  cookieStore.set("user_id", newUser.id, {
    httpOnly: true, // Security: JS can't steal this cookie
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}


export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Find the user in Docker
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // 2. Security Check: If user doesn't exist, don't say why (Prevents email fishing)
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // 3. Compare the "Plain Text" password with the "Hashed" password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // 4. Success! Set the cookie
  const cookieStore = await cookies();
  cookieStore.set("user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/");
}


export async function submitIdea(formData: FormData) {
  const content = formData.get("content") as string;
  const meetingId = formData.get("meetingId") as string;

  if (!content || !meetingId) return;

  await db.insert(ideas).values({
    content: content,
    meetingId: meetingId,
  });
  revalidatePath(`/meeting/${meetingId}`); 
}
 

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id"); // Remove the VIP pass
  redirect("/");
}


export async function createMeeting(formData: FormData) {
  const title = formData.get("title") as string;

 if (!title) return;

  await db.insert(meetings).values({
    title: title,
  });
  revalidatePath("/"); 
}

export async function deleteMeeting(id: string) {
  // SQL: DELETE FROM meetings WHERE id = [id]
  await db.delete(meetings).where(eq(meetings.id, id));

  // Refresh the home page list
  revalidatePath("/");
}

