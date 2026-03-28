import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface MeetingPageProps {
  params: Promise<{ meetingId: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId } = await params;

  // Fetch the specific meeting from Docker
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) {
    notFound(); // Shows the 404 page if the ID doesn't exist
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">{meeting.title}</h1>
      <p className="text-zinc-500">Meeting ID: {meetingId}</p>
      
      {/* This is where we will eventually put the "Idea Feed" */}
      <div className="mt-10 border-t border-zinc-800 pt-10">
        <p>Waiting for ideas...</p>
      </div>
    </div>
  );
}