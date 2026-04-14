import { pgTable, uuid, text, timestamp,primaryKey } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const ideasRelations = relations(ideas, ({ one, many }) => ({
  author: one(users, { fields: [ideas.authorId], references: [users.id] }),
  meeting: one(meetings, {fields: [ideas.meetingId],references: [meetings.id],}),
  votes: many(votes), // An idea can have many votes
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

