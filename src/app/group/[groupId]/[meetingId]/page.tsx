import { db } from "@/db";
import { meetings,ideas,users, groups, groupMembers } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { submitIdea } from "@/app/actions";
import { cookies } from "next/headers";
import VoteButton from "@/components/VoteButton";

import DeleteMeetingButton from "@/components/DeleteMeetingButton";
import DeleteIdeaButton from "@/components/DeleteIdeaButton";

import AddMeetingMembersButton from "@/components/AddMeetingMembersButton";


interface MeetingPageProps {
  params: Promise<{ meetingId: string, groupId: string}>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { meetingId } = await params;
  const { groupId } = await params;

  // Get the current user's ID to check if they've already voted
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("user_id")?.value;

  

  // Fetch the specific meeting from Docker
  const meeting = await db.query.meetings.findFirst({
    where: eq(meetings.id, meetingId),
  });

  if (!meeting) notFound();

  const isOwner = meeting.creatorId === currentUserId;

  // Fetch ideas with Authors AND Votes using Relational Queries
  const meetingIdeas = await db.query.ideas.findMany({
    where: eq(ideas.meetingId, meetingId),
    with: {
      author: true,
      votes: true, // This brings in the array of votes for each idea
    },
    orderBy: (ideas, { desc }) => [desc(ideas.createdAt)],
  });

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  const myGroupMembership = currentUserId
    ? await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, currentUserId)
        ),
      })
    : null;

  const canManageMeetingMembers =
    isOwner ||
    group?.creatorId === currentUserId ||
    myGroupMembership?.role === "admin";

  return (
   <main className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">{meeting.title}</h1>
          <p className="text-gray-500 font-mono text-sm">Organized by {isOwner ? "You" : "a Colleague"}</p>
        </div>

        {canManageMeetingMembers && (
          <AddMeetingMembersButton
            meetingId={meetingId}
            canManage={!!canManageMeetingMembers}
          />
        )}

        {/* Only show the Delete button if YOU are the owner */}
        {isOwner && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Meeting Admin</span>
            <DeleteMeetingButton id={meetingId} groupId={groupId} />
          </div>
        )}
      </div>
      {/* 3. The Submit Idea Form */}
      <form action={submitIdea} className="mb-10 flex gap-2">
        {/* WE NEED A HIDDEN INPUT TO SEND THE MEETING ID */}
        <input type="hidden" name="meetingId" value={meetingId} />
        <input type="hidden" name="groupId" value={groupId} />
        
        <input 
          name="content" 
          placeholder="Type a new idea..." 
          className="flex-grow p-3 border rounded-lg bg-white text-black"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">
          Add Idea
        </button>
      </form>

      {/* 4. The Ideas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetingIdeas.map((idea) =>{
        // Check if the currently logged-in user is in the list of votes
          const hasVoted = idea.votes.some(v => v.userId === currentUserId);
          const canDelete = idea.authorId === currentUserId || isOwner;

         return(
          <div key={idea.id} className="group relative p-4 border rounded-xl shadow-sm bg-yellow-50 border-yellow-200">
            {/* Delete Button - Top Right */}
            
            {canDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DeleteIdeaButton ideaId={idea.id} meetingId={meetingId} groupId={groupId} />
              </div>
            )}
            <p className="text-gray-800">{idea.content}</p>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold text-xs border border-zinc-200">
                    {idea.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{idea.author.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Contributor</p>
                  </div>
                </div>

                {/* The new Voting Button */}
                <VoteButton 
                  ideaId={idea.id} 
                  meetingId={meetingId} 
                  count={idea.votes.length} 
                  hasVoted={hasVoted}
                  groupId={groupId}
                />
              </div>
          </div>
          )
        })}
      </div>
    </main>
  );
}