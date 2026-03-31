import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

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
  // NEW: Link to the User who wrote the idea
  authorId: uuid("author_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});