import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Meeting Room table
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  // NEW: Link to the User who created the meeting
  creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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