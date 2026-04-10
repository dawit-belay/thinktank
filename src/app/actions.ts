"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas, groups, meetings, users, votes, groupMembers } from "@/db/schema";
import { eq,and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthActionState = {
  ok: boolean;
  formError?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
  ): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<AuthActionState["fieldErrors"]> = {};

  if (!name) {
    fieldErrors.name = "Name is required.";
  }
  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Please enter a valid email.";
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  } else if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { ok: false, fieldErrors: { email: "Email already exists." } };
  }

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


export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: NonNullable<AuthActionState["fieldErrors"]> = {};

  if (!email) {
    fieldErrors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    fieldErrors.email = "Please enter a valid email.";
  }
  if (!password) {
    fieldErrors.password = "Password is required.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  // 1. Find the user in Docker
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // 2. Security Check: If user doesn't exist, don't say why (Prevents email fishing)
  if (!user) {
    return { ok: false, formError: "Invalid credentials." };
  }

  // 3. Compare the "Plain Text" password with the "Hashed" password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { ok: false, formError: "Invalid credentials." };
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
  const groupId = formData.get("groupId") as string;

  // 1. Get the User ID
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!content || !meetingId|| !userId) return;

  await db.insert(ideas).values({
    content: content,
    meetingId: meetingId,
    authorId: userId,
  });
  revalidatePath(`/group/${groupId}/${meetingId}`); 
}
 

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id"); // Remove the VIP pass
  redirect("/");
}


export async function createMeeting(formData: FormData) {
  const title = formData.get("title") as string;
  const groupId = formData.get("groupId") as string;

  if (!groupId) {
    throw new Error("groupId is missing");
  }
 if (!title) return;

 // 1. Get the User ID from the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 2. Security Check: If not logged in, they can't create rooms
  if (!userId) {
    throw new Error("You must be logged in to create a meeting.");
  }

  // 3. Save with the creatorId
  await db.insert(meetings).values({
    title: title,
    creatorId: userId,
    groupId,
  });
  revalidatePath(`/group/${groupId}`); 
}

export async function creategroup(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

 if (!name) return;

 // 1. Get the User ID from the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 2. Security Check: If not logged in, they can't create rooms
  if (!userId) {
    throw new Error("You must be logged in to create a group.");
  }

  // 3. Save with the creatorId
  await db.insert(groups).values({
    name,
    description,
    creatorId: userId,
  });

  revalidatePath("/group"); 
}

export async function deleteMeeting(id: string, groupId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 1. Fetch the meeting to see who owns it
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, id),
  });

  // 2. SECURITY CHECK: If I am not the owner, I cannot delete it
  if (!meeting || meeting.creatorId !== userId) {
    throw new Error("Unauthorized: You do not own this meeting.");
  }

  // 3. Delete from Docker
  await db.delete(meetings).where(eq(meetings.id, id));

  // 4. Go back to the dashboard
  revalidatePath(`/group/${groupId}`);
  redirect("/");
}

export async function deleteIdea(ideaId: string, meetingId: string, groupId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 1. Fetch the idea and the meeting to check permissions
  const idea = await db.query.ideas.findFirst({
    where: eq(ideas.id, ideaId),
    with: { meeting: true }
  });

  if (!idea) throw new Error("Idea not found");

  // 2. SECURITY CHECK: Are you the Author OR the Meeting Owner?
  const isAuthor = idea.authorId === userId;
  const isMeetingOwner = idea.meeting.creatorId === userId;

  if (!isAuthor && !isMeetingOwner) {
    throw new Error("Unauthorized to delete this idea");
  }

  // 3. Delete the idea (Votes will auto-delete due to 'cascade' in schema)
  await db.delete(ideas).where(eq(ideas.id, ideaId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
}


export async function toggleVote(ideaId: string, meetingId: string, groupId: string) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) throw new Error("You must be logged in to vote.");

  // 1. Check if this specific user already voted for this specific idea
  const existingVote = await db.query.votes.findFirst({
    where: and(eq(votes.userId, userId), eq(votes.ideaId, ideaId)),
  });

  if (existingVote) {
    // 2. Remove the vote
    await db.delete(votes).where(eq(votes.id, existingVote.id));
  } else {
    // 3. Add the vote
    await db.insert(votes).values({ userId, ideaId });
  }

  `/group/${groupId}/${meetingId}`
}