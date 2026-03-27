import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

// The Meeting Room table
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// The Brainstorming Ideas table
export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  votes: integer("votes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});