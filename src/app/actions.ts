"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function submitIdea(formData: FormData) {
  const content = formData.get("content") as string;

  if (!content) return { error: "Content is required" };

  try {
    // This is the SQL 'INSERT' command via Drizzle
    await db.insert(ideas).values({
      content: content,
      // For now, we'll omit meetingId or use a dummy UUID to test
    });

    // This clears the cache so the new idea shows up immediately
    revalidatePath("/"); 
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Failed to save idea to Docker DB" };
  }
}