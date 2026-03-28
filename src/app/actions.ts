"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas } from "@/db/schema";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

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

