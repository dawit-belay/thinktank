"use client";

import { useState, useTransition, useRef } from "react";
import { MessageSquare, Send, CornerDownRight, X } from "lucide-react";
import { submitComment, deleteComment } from "@/app/actions";

export type CommentData = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  parentId: string | null;
  createdAt: string;
};

type Props = {
  ideaId: string;
  meetingId: string;
  groupId: string;
  initialComments: CommentData[];
  currentUserId?: string;
  meetingCreatorId: string;
  isAnonymous: boolean;
  meetingStage: "ideation" | "decision" | "summary";
};

export default function CommentSection({
  ideaId,
  meetingId,
  groupId,
  initialComments,
  currentUserId,
  meetingCreatorId,
  isAnonymous,
  meetingStage,
}: Props) {
  const hideAuthors = isAnonymous && meetingStage === "ideation";
  const [isOpen, setIsOpen] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const mainFormRef = useRef<HTMLFormElement>(null);
  const replyFormRef = useRef<HTMLFormElement>(null);

  const topLevel = initialComments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) =>
    initialComments.filter((c) => c.parentId === parentId);

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    parentId: string | null = null
  ) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("content") as HTMLInputElement;
    const content = input.value.trim();
    if (!content) return;

    const fd = new FormData();
    fd.set("content", content);
    fd.set("ideaId", ideaId);
    fd.set("meetingId", meetingId);
    fd.set("groupId", groupId);
    if (parentId) fd.set("parentId", parentId);

    startTransition(async () => {
      await submitComment(fd);
      form.reset();
      if (parentId) setReplyToId(null);
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      await deleteComment(commentId, meetingId, groupId);
    });
  }

  const count = initialComments.length;

  return (
    <div className="mt-3 border-t border-zinc-100 pt-3">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-emerald-600"
      >
        <MessageSquare size={13} />
        {count > 0
          ? `${count} comment${count !== 1 ? "s" : ""}`
          : "Add comment"}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {topLevel.map((comment) => {
            const replies = getReplies(comment.id);
            const canDelete =
              comment.authorId === currentUserId ||
              meetingCreatorId === currentUserId;

            return (
              <div key={comment.id}>
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="rounded-xl bg-zinc-50 px-3 py-2">
                      <p className="text-xs font-semibold text-zinc-700">
                        {hideAuthors ? "Anonymous" : comment.authorName}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-600">
                        {comment.content}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      {currentUserId && (
                        <button
                          onClick={() =>
                            setReplyToId(
                              replyToId === comment.id ? null : comment.id
                            )
                          }
                          className="text-[11px] font-medium text-zinc-400 transition hover:text-emerald-600"
                        >
                          Reply
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={isPending}
                          className="text-[11px] font-medium text-zinc-400 transition hover:text-red-500 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {replies.length > 0 && (
                  <div className="ml-8 mt-2 space-y-2">
                    {replies.map((reply) => {
                      const canDeleteReply =
                        reply.authorId === currentUserId ||
                        meetingCreatorId === currentUserId;
                      return (
                        <div key={reply.id} className="flex gap-2">
                          <CornerDownRight
                            size={12}
                            className="mt-1.5 shrink-0 text-zinc-300"
                          />
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-600">
                            {reply.authorName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="rounded-xl bg-zinc-50 px-3 py-2">
                              <p className="text-xs font-semibold text-zinc-700">
                                {hideAuthors ? "Anonymous" : reply.authorName}
                              </p>
                              <p className="mt-0.5 text-xs text-zinc-600">
                                {reply.content}
                              </p>
                            </div>
                            {canDeleteReply && (
                              <button
                                onClick={() => handleDelete(reply.id)}
                                disabled={isPending}
                                className="mt-1 text-[11px] font-medium text-zinc-400 transition hover:text-red-500 disabled:opacity-40"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyToId === comment.id && currentUserId && (
                  <form
                    ref={replyFormRef}
                    onSubmit={(e) => handleSubmit(e, comment.id)}
                    className="ml-8 mt-2 flex gap-2"
                  >
                    <input
                      name="content"
                      placeholder={`Reply to ${hideAuthors ? "Anonymous" : comment.authorName}…`}
                      autoFocus
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      <Send size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="rounded-lg border border-zinc-200 px-2 py-1.5 text-zinc-400 transition hover:text-zinc-600"
                    >
                      <X size={12} />
                    </button>
                  </form>
                )}
              </div>
            );
          })}

          {currentUserId && (
            <form
              ref={mainFormRef}
              onSubmit={(e) => handleSubmit(e, null)}
              className="flex gap-2"
            >
              <input
                name="content"
                placeholder="Add a comment…"
                className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-emerald-500 px-3 py-1.5 text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
