type Props = {
    title: string;
    stage: "ideation" | "decision" | "summary";
    ideaCount: number;
    participantCount: number;
    scheduledStartAt: Date | string | null;
    scheduledEndAt: Date | string | null;
    isOwner: boolean;
    isAnonymous: boolean;
  };

  export default function MeetingHeader({
    title,
    stage,
    ideaCount,
    participantCount,
    scheduledStartAt,
    scheduledEndAt,
    isOwner,
    isAnonymous,
  }: Props) {
    const hasSchedule = scheduledStartAt && scheduledEndAt;
    const stagePillStyles = {
      ideation: "bg-emerald-100 text-emerald-800 border-emerald-200",
      decision: "bg-amber-100 text-amber-800 border-amber-200",
      summary: "bg-violet-100 text-violet-800 border-violet-200",
    };

    return (
      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${stagePillStyles[stage]}`}
          >
            {stage}
          </span>
          <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            {isOwner ? "Owner" : "Collaborator"}
          </span>
          {isAnonymous && stage === "ideation" && (
            <span className="rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
              Anonymous
            </span>
          )}
        </div>
        <h1 className="text-balance text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          {ideaCount} ideas shared · {participantCount} participants in room
        </p>
        {hasSchedule && (
          <p className="mt-1 text-sm font-medium text-zinc-500">
            Scheduled:{" "}
            {new Date(scheduledStartAt).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {new Date(scheduledEndAt).toLocaleString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        )}
      </header>
    );
  }