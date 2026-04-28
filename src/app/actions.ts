"use server";

import { db } from "@/db"; // Adjust this path based on where your db/index.ts is
import { ideas, groups, meetings, users, votes, groupMembers, meetingMembers, comments, actionItems, notifications } from "@/db/schema";
import { sendGroupInviteEmail, sendMeetingInviteEmail } from "@/lib/email";
import { eq, and, or, ilike, notInArray } from "drizzle-orm";
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
  const scheduledStartAtRaw = String(formData.get("scheduledStartAt") ?? "");
  const scheduledEndAtRaw = String(formData.get("scheduledEndAt") ?? "");
  const isAnonymous = formData.get("isAnonymous") === "on";
  const templateTypeRaw = formData.get("templateType") as string | null;
  const templateType = templateTypeRaw || null;

  if (!groupId) {
    throw new Error("groupId is missing");
  }
 if (!title) return;

  const scheduledStartAt = new Date(scheduledStartAtRaw);
  const scheduledEndAt = new Date(scheduledEndAtRaw);

  if (
    !scheduledStartAtRaw ||
    !scheduledEndAtRaw ||
    Number.isNaN(scheduledStartAt.getTime()) ||
    Number.isNaN(scheduledEndAt.getTime())
  ) {
    throw new Error("Valid meeting start and end times are required.");
  }

  if (scheduledEndAt <= scheduledStartAt) {
    throw new Error("Meeting end time must be after start time.");
  }

 // 1. Get the User ID from the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 2. Security Check: If not logged in, they can't create rooms
  if (!userId) {
    throw new Error("You must be logged in to create a meeting.");
  }

  // 3. Save with the creatorId
  const [newMeeting] = await db.insert(meetings).values({
    title: title,
    creatorId: userId,
    groupId,
    scheduledStartAt,
    scheduledEndAt,
    isAnonymous,
    templateType: templateType as "retrospective" | "okr_planning" | "standup" | "decision_log" | null,
  }).returning();

  await db.insert(meetingMembers).values({
    meetingId: newMeeting.id,
    userId: userId,
    role: "admin"
  });


  revalidatePath(`/group/${groupId}`); 
  redirect(`/group/${groupId}`);
}

export async function creategroup(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || "";

 if (!name) return;

 // 1. Get the User ID from the cookie
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  // 2. Security Check: If not logged in, they can't create rooms
  if (!userId) {
    throw new Error("You must be logged in to create a group.");
  }

  // 3. Insert group and RETURN it
  const [newGroup] = await db.insert(groups).values({
    name,
    description,
    creatorId: userId,
  }).returning();

  // 4. Save the creatorId into groupmembers
  await db.insert(groupMembers).values({
    groupId: newGroup.id,
    userId: userId,
    role: "admin"
  });

  revalidatePath("/group"); 
  redirect("/group");
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
  redirect(`/group/${groupId}`);
}

export async function deleteIdea(
  ideaId: string,
  meetingId: string,
  groupId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return { ok: false, error: "You must be logged in." };
  }

  // 1. Fetch the idea and the meeting to check permissions
  const idea = await db.query.ideas.findFirst({
    where: eq(ideas.id, ideaId),
    with: { meeting: true }
  });

  if (!idea) return { ok: false, error: "Idea not found." };

  // 2. SECURITY CHECK: Are you the Author OR the Meeting Owner?
  const isAuthor = idea.authorId === userId;
  const isMeetingOwner = idea.meeting.creatorId === userId;

  if (!isAuthor && !isMeetingOwner) {
    return { ok: false, error: "Unauthorized to delete this idea." };
  }

  // 3. Delete the idea (Votes will auto-delete due to 'cascade' in schema)
  try {
    await db.delete(ideas).where(eq(ideas.id, ideaId));
  } catch {
    return { ok: false, error: "Could not delete idea." };
  }

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
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

  revalidatePath(`/group/${groupId}/${meetingId}`);
}

export type SearchableUser = {
  id: string;
  name: string;
  email: string;
};

async function assertCanManageGroup(
  groupId: string,
  userId: string
): Promise<boolean> {
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });
  if (!group) return false;
  if (group.creatorId === userId) return true;
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  return membership?.role === "admin";
}

export async function searchUsersForGroup(
  groupId: string,
  query: string
): Promise<
  { ok: true; users: SearchableUser[] } | { ok: false; error: string }
> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!(await assertCanManageGroup(groupId, userId))) {
    return { ok: false, error: "You do not have permission to add members." };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { ok: true, users: [] };
  }

  const memberRows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  const memberIds = memberRows.map((r) => r.userId);

  const searchPattern = `%${trimmed}%`;

  const whereParts = [
    or(ilike(users.name, searchPattern), ilike(users.email, searchPattern)),
  ];
  if (memberIds.length > 0) {
    whereParts.push(notInArray(users.id, memberIds));
  }

  const results = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(...whereParts))
    .limit(20);

  return { ok: true, users: results };
}

export async function inviteUserToGroup(
  groupId: string,
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }
  if (!(await assertCanManageGroup(groupId, userId))) {
    return { ok: false, error: "You do not have permission to add members." };
  }

  const existing = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, targetUserId)
    ),
  });
  if (existing) {
    return { ok: false, error: "User is already a member." };
  }

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });
  if (!target) {
    return { ok: false, error: "User not found." };
  }

  try {
    await db.insert(groupMembers).values({
      groupId,
      userId: targetUserId,
      role: "member",
    });
  } catch {
    return { ok: false, error: "Could not add member." };
  }

  const [inviter, group] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.groups.findFirst({ where: eq(groups.id, groupId) }),
  ]);

  if (inviter && group && target) {
    await db.insert(notifications).values({
      userId: targetUserId,
      type: "group_invite",
      message: `${inviter.name} invited you to "${group.name}"`,
      link: `/group/${groupId}`,
    });
    void sendGroupInviteEmail({
      to: target.email,
      toName: target.name,
      inviterName: inviter.name,
      groupName: group.name,
      groupId,
    });
  }

  revalidatePath(`/group/${groupId}`);
  return { ok: true };
}


async function assertCanManageMeeting(
  meetingId: string,
  userId: string
): Promise<{ ok: true; meeting: { id: string; groupId: string; creatorId: string } } | { ok: false }> {
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) return { ok: false };

  // Meeting creator can always manage
  if (meeting.creatorId === userId) {
    return { ok: true, meeting };
  }

  // Group creator/admin can also manage (same rule style as groups)
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, meeting.groupId),
  });

  if (!group) return { ok: false };

  if (group.creatorId === userId) {
    return { ok: true, meeting };
  }

  const groupMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, meeting.groupId),
      eq(groupMembers.userId, userId)
    ),
  });

  if (groupMembership?.role === "admin") {
    return { ok: true, meeting };
  }

  return { ok: false };
}

export async function searchUsersForMeeting(
  meetingId: string,
  query: string
): Promise<{ ok: true; users: SearchableUser[] } | { ok: false; error: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }
  const permission = await assertCanManageMeeting(meetingId, userId);
  if (!permission.ok) {
    return { ok: false, error: "You do not have permission to add meeting members." };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { ok: true, users: [] };
  }

  const groupId = permission.meeting.groupId;

  // Only allow users already in this group
  const groupRows = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));

  const groupUserIds = groupRows.map((r) => r.userId);

  if (groupUserIds.length === 0) {
    return { ok: true, users: [] };
  }

  // Exclude users already in this meeting
  const meetingRows = await db
    .select({ userId: meetingMembers.userId })
    .from(meetingMembers)
    .where(eq(meetingMembers.meetingId, meetingId));

  const meetingUserIds = meetingRows.map((r) => r.userId);

  const searchPattern = `%${trimmed}%`;

  const whereParts = [
    or(ilike(users.name, searchPattern), ilike(users.email, searchPattern)),
    // must be in group
    // NOTE: if you have inArray imported, use it. If not, keep this by filtering after query.
  ];

  // Simpler and reliable approach with current imports: query then filter in memory
  const candidates = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(and(...whereParts))
    .limit(100);

  const allowed = candidates
    .filter((u) => groupUserIds.includes(u.id))
    .filter((u) => !meetingUserIds.includes(u.id))
    .filter((u) => u.id !== userId) // optional: don't show yourself
    .slice(0, 20);

  return { ok: true, users: allowed };
}

export async function inviteUserToMeeting(
  meetingId: string,
  targetUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return { ok: false, error: "You must be signed in." };
  }

  const permission = await assertCanManageMeeting(meetingId, userId);
  if (!permission.ok) {
    return { ok: false, error: "You do not have permission to add meeting members." };
  }

  const groupId = permission.meeting.groupId;

  // Ensure target exists
  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
  });
  if (!target) {
    return { ok: false, error: "User not found." };
  }

  // Ensure target is in group first
  const targetGroupMembership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, groupId),
      eq(groupMembers.userId, targetUserId)
    ),
  });

  if (!targetGroupMembership) {
    return { ok: false, error: "User must be a group member first." };
  }

  // Prevent duplicate meeting membership
  const existingMeetingMembership = await db.query.meetingMembers.findFirst({
    where: and(
      eq(meetingMembers.meetingId, meetingId),
      eq(meetingMembers.userId, targetUserId)
    ),
  });

  if (existingMeetingMembership) {
    return { ok: false, error: "User is already in this meeting." };
  }

  try {
    await db.insert(meetingMembers).values({
      meetingId,
      userId: targetUserId,
      role: "member",
    });
  } catch {
    return { ok: false, error: "Could not add user to meeting." };
  }

  const [inviter, meeting] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.meetings.findFirst({ where: eq(meetings.id, meetingId) }),
  ]);

  if (inviter && meeting && target) {
    await db.insert(notifications).values({
      userId: targetUserId,
      type: "meeting_invite",
      message: `${inviter.name} added you to "${meeting.title}"`,
      link: `/group/${groupId}/${meetingId}`,
    });
    void sendMeetingInviteEmail({
      to: target.email,
      toName: target.name,
      inviterName: inviter.name,
      meetingTitle: meeting.title,
      groupId,
      meetingId,
    });
  }

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

export async function markAllNotificationsRead(): Promise<void> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function updateMeetingStage(
  meetingId: string,
  stage: "ideation" | "decision" | "summary",
  groupId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });
  if (!meeting) return { ok: false, error: "Meeting not found." };

  // Permission: meeting owner or group admin
  const isOwner = meeting.creatorId === userId;
  let canManage = isOwner;

  if (!canManage) {
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, meeting.groupId),
        eq(groupMembers.userId, userId)
      ),
    });
    canManage = membership?.role === "admin";
  }

  if (!canManage) {
    return { ok: false, error: "Unauthorized." };
  }

  await db
    .update(meetings)
    .set({
      stage,
      ...(stage === "summary" ? { closedAt: new Date() } : {}),
    })
    .where(eq(meetings.id, meetingId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function saveMeetingDecision(
  meetingId: string,
  groupId: string,
  decisionText: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });
  if (!meeting) return { ok: false, error: "Meeting not found." };

  const isOwner = meeting.creatorId === userId;
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, meeting.groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  const isAdmin = membership?.role === "admin";

  if (!isOwner && !isAdmin) return { ok: false, error: "Unauthorized." };

  const trimmed = decisionText.trim();
  if (!trimmed) return { ok: false, error: "Decision cannot be empty." };

  await db
    .update(meetings)
    .set({ decisionText: trimmed })
    .where(eq(meetings.id, meetingId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function saveMeetingSummary(
  meetingId: string,
  groupId: string,
  summary: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });
  if (!meeting) return { ok: false, error: "Meeting not found." };

  const isOwner = meeting.creatorId === userId;
  const membership = await db.query.groupMembers.findFirst({
    where: and(
      eq(groupMembers.groupId, meeting.groupId),
      eq(groupMembers.userId, userId)
    ),
  });
  const isAdmin = membership?.role === "admin";

  if (!isOwner && !isAdmin) return { ok: false, error: "Unauthorized." };

  await db
    .update(meetings)
    .set({ summary: summary.trim() || null })
    .where(eq(meetings.id, meetingId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function submitComment(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const content = String(formData.get("content") ?? "").trim();
  const ideaId = formData.get("ideaId") as string;
  const meetingId = formData.get("meetingId") as string;
  const groupId = formData.get("groupId") as string;
  const parentId = formData.get("parentId") as string | null;

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!content) return { ok: false, error: "Comment cannot be empty." };
  if (!ideaId || !meetingId) return { ok: false, error: "Invalid request." };

  const membership = await db.query.meetingMembers.findFirst({
    where: and(eq(meetingMembers.meetingId, meetingId), eq(meetingMembers.userId, userId)),
  });
  if (!membership) return { ok: false, error: "You are not a member of this meeting." };

  await db.insert(comments).values({
    ideaId,
    authorId: userId,
    content,
    parentId: parentId || null,
  });

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
  meetingId: string,
  groupId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: { idea: { with: { meeting: true } } },
  });

  if (!comment) return { ok: false, error: "Comment not found." };

  const isAuthor = comment.authorId === userId;
  const isMeetingOwner = comment.idea.meeting.creatorId === userId;

  if (!isAuthor && !isMeetingOwner) {
    return { ok: false, error: "Unauthorized." };
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function createActionItem(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const content = String(formData.get("content") ?? "").trim();
  const meetingId = formData.get("meetingId") as string;
  const groupId = formData.get("groupId") as string;
  const assigneeId = formData.get("assigneeId") as string;
  const dueDateRaw = String(formData.get("dueDate") ?? "");

  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!content) return { ok: false, error: "Content is required." };
  if (!assigneeId) return { ok: false, error: "Assignee is required." };

  const permission = await assertCanManageMeeting(meetingId, userId);
  if (!permission.ok) return { ok: false, error: "Only meeting admins can create action items." };

  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  await db.insert(actionItems).values({
    meetingId,
    assigneeId,
    creatorId: userId,
    content,
    dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : null,
    status: "open",
  });

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function deleteActionItem(
  itemId: string,
  meetingId: string,
  groupId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const permission = await assertCanManageMeeting(meetingId, userId);
  if (!permission.ok) return { ok: false, error: "Only meeting admins can delete action items." };

  await db.delete(actionItems).where(eq(actionItems.id, itemId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}

export async function toggleActionItemStatus(
  itemId: string,
  meetingId: string,
  groupId: string
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const item = await db.query.actionItems.findFirst({
    where: eq(actionItems.id, itemId),
  });
  if (!item) return { ok: false, error: "Action item not found." };

  const isAssignee = item.assigneeId === userId;
  const permission = await assertCanManageMeeting(meetingId, userId);
  if (!isAssignee && !permission.ok) {
    return { ok: false, error: "Only the assignee or a meeting admin can update this item." };
  }

  await db
    .update(actionItems)
    .set({ status: item.status === "open" ? "done" : "open" })
    .where(eq(actionItems.id, itemId));

  revalidatePath(`/group/${groupId}/${meetingId}`);
  return { ok: true };
}