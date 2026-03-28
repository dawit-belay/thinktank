"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas } from "@/db/schema";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

export async function submitIdea(formData: FormData) {
  const content = formData.get("content") as string;

  if (!content) return { error: "Content is required" };

  try {
    await db.insert(ideas).values({content: content,});
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to save idea to Docker DB" };
  }
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

