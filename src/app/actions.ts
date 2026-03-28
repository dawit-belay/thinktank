"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas } from "@/db/schema";
import { meetings } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

  try{
    const [newMeeting] = await db.insert(meetings)
        .values({title: title,}).returning();
    revalidatePath("/");
    redirect(`/meeting/${newMeeting.id}`);
  } catch (error){
    console.error("Database Error:", error);
    throw error; // ✅ THIS FIXES IT
  }  
}