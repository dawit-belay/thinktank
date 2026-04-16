type Member = {
    userId: string;
    role: "admin" | "member" | null;
    user: { name: string; email: string };
  };
  
  export default function MeetingParticipantsPanel({ members }: { members: Member[] }) {
    return (
      <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-4 shadow-sm shadow-zinc-200/30">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-600">
            Participants
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
            {members.length}
          </span>
        </div>
        <ul className="mt-3 space-y-2">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-2">
              <div>
                <p className="text-sm font-semibold text-zinc-900">{m.user.name}</p>
                <p className="text-xs text-zinc-500">{m.user.email}</p>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wide text-zinc-600">
                {m.role ?? "member"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }