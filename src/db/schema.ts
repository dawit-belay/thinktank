import { pgTable, uuid, text, timestamp, primaryKey, boolean, uniqueIndex, type AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 1. The Group Table
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Members Table (The link between Users and Groups)
export const groupMembers = pgTable("group_members", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  role: text("role").$type<"admin" | "member">().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
}, (t) => ({
  // This ensures a user can't join the same group twice
  pk: primaryKey({ columns: [t.userId, t.groupId] }),
}));

// The Meeting Room table
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  // NEW: Link to the User who created the meeting
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }).notNull(),
  scheduledStartAt: timestamp("scheduled_start_at"),
  scheduledEndAt: timestamp("scheduled_end_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stage: text("stage")
  .$type<"ideation" | "decision" | "summary">()
  .default("ideation")
  .notNull(),
  decisionText: text("decision_text"),
  summary: text("summary"),
  closedAt: timestamp("closed_at"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  templateType: text("template_type").$type<"retrospective" | "okr_planning" | "standup" | "decision_log">(),
  ideasDueBy: timestamp("ideas_due_by"),
});

// The Members Table (The link between Users and meetings)
export const meetingMembers = pgTable("meeting_members", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "cascade" }).notNull(),
  role: text("role").$type<"admin" | "member">().default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull()
}, (t) => ({
  // This ensures a user can't join the same meeting twice
  pk: primaryKey({ columns: [t.userId, t.meetingId] }),
}));

// The Brainstorming Ideas table
export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Notifications Table (in-app alerts for invites etc.)
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").$type<"group_invite" | "meeting_invite">().notNull(),
  message: text("message").notNull(),
  link: text("link").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

// The Action Items Table (tasks assigned from meeting decisions)
export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "cascade" }).notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  dueDate: timestamp("due_date"),
  status: text("status").$type<"open" | "done">().default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Reactions Table (emoji reactions on ideas)
export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ideaId: uuid("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueUserIdeaEmoji: uniqueIndex("reactions_user_idea_emoji").on(t.userId, t.ideaId, t.emoji),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  idea: one(ideas, { fields: [reactions.ideaId], references: [ideas.id] }),
}));

// The Comments Table (threaded discussion on ideas)
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ideaId: uuid("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  parentId: uuid("parent_id").references((): AnyPgColumn => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The NEW Votes Table (The "Junction" Table)
export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  ideaId: uuid("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Define the Relations so Drizzle can "Join" them easily
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.userId], references: [users.id] }),
  idea: one(ideas, { fields: [votes.ideaId], references: [ideas.id] }),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  meeting: one(meetings, { fields: [actionItems.meetingId], references: [meetings.id] }),
  assignee: one(users, { fields: [actionItems.assigneeId], references: [users.id], relationName: "assigned_items" }),
  creator: one(users, { fields: [actionItems.creatorId], references: [users.id], relationName: "created_items" }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  idea: one(ideas, { fields: [comments.ideaId], references: [ideas.id] }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, { relationName: "comment_replies" }),
}));

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  author: one(users, { fields: [ideas.authorId], references: [users.id] }),
  meeting: one(meetings, {fields: [ideas.meetingId],references: [meetings.id],}),
  votes: many(votes),
  comments: many(comments),
  reactions: many(reactions),
}));


export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  meetings: many(meetings),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));


export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  group: one(groups, {
    fields: [meetings.groupId],
    references: [groups.id],
  }),
  creator: one(users, {
    fields: [meetings.creatorId],
    references: [users.id],
  }),
  members: many(meetingMembers),
  ideas: many(ideas),
  actionItems: many(actionItems),
}));

export const meetingMembersRelations = relations(meetingMembers, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingMembers.meetingId],
    references: [meetings.id],
  }),
  user: one(users, {
    fields: [meetingMembers.userId],
    references: [users.id],
  }),
}));


// /4J%@qTsY8wY+d%
