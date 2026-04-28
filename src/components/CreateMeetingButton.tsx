"use client";

import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { PlusCircle, EyeOff, ArrowLeft } from "lucide-react";
import { createMeeting } from "@/app/actions";
import { TEMPLATE_LIST, type TemplateType } from "@/lib/templates";

function getDefaultDateTimeLocal(minutesFromNow: number) {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  date.setSeconds(0, 0);
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating..." : "Create room"}
    </button>
  );
}

type Props = { groupId: string; className?: string };

export default function CreateMeetingButton({ groupId, className }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [step, setStep] = useState<"pick" | "form">("pick");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  function open() {
    setStep("pick");
    setSelectedTemplate(null);
    setIsAnonymous(false);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function pickTemplate(key: TemplateType | null) {
    setSelectedTemplate(key);
    setStep("form");
  }

  const template = selectedTemplate
    ? TEMPLATE_LIST.find((t) => t.key === selectedTemplate) ?? null
    : null;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={
          className ??
          "inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-600"
        }
      >
        <PlusCircle size={18} strokeWidth={2.25} />
        New room
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="fixed inset-0 z-50 m-auto h-fit w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-zinc-200 bg-white p-0 text-zinc-900 shadow-2xl shadow-zinc-400/30 backdrop:bg-zinc-900/25 backdrop:backdrop-blur-sm"
      >
        {/* ── Step 1: Template Picker ── */}
        {step === "pick" && (
          <>
            <div className="border-b border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-5">
              <h2 id={titleId} className="text-2xl font-bold tracking-tight text-zinc-900">
                Choose a template
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Templates pre-fill prompts to guide your session, or start blank.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATE_LIST.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => pickTemplate(t.key)}
                    className="group flex flex-col gap-1.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60"
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <p className="font-bold text-zinc-900">{t.label}</p>
                    <p className="text-xs text-zinc-500 leading-snug">{t.description}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => pickTemplate(null)}
                className="mt-3 w-full rounded-2xl border border-dashed border-zinc-200 py-3 text-sm font-semibold text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-700"
              >
                Start blank
              </button>

              <div className="mt-5 flex justify-end border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: Form ── */}
        {step === "form" && (
          <>
            <div className="border-b border-zinc-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-5">
              <button
                type="button"
                onClick={() => setStep("pick")}
                className="mb-3 flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-700"
              >
                <ArrowLeft size={13} />
                Change template
              </button>
              <div className="flex items-center gap-2">
                {template && <span className="text-2xl">{template.emoji}</span>}
                <h2 id={titleId} className="text-2xl font-bold tracking-tight text-zinc-900">
                  {template ? template.label : "New room"}
                </h2>
              </div>
              {template && (
                <p className="mt-1 text-sm text-zinc-500">{template.description}</p>
              )}
            </div>

            <form action={createMeeting} className="px-6 py-5">
              <input type="hidden" name="groupId" value={groupId} />
              {selectedTemplate && (
                <input type="hidden" name="templateType" value={selectedTemplate} />
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="meeting-title" className="mb-2 block text-sm font-semibold text-zinc-700">
                    Room title
                  </label>
                  <input
                    id="meeting-title"
                    name="title"
                    placeholder="Q3 planning session"
                    defaultValue={template?.defaultTitle ?? ""}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="meeting-start" className="mb-2 block text-sm font-semibold text-zinc-700">
                      Start time
                    </label>
                    <input
                      id="meeting-start"
                      name="scheduledStartAt"
                      type="datetime-local"
                      defaultValue={getDefaultDateTimeLocal(30)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-end" className="mb-2 block text-sm font-semibold text-zinc-700">
                      End time
                    </label>
                    <input
                      id="meeting-end"
                      name="scheduledEndAt"
                      type="datetime-local"
                      defaultValue={getDefaultDateTimeLocal(90)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 transition hover:bg-zinc-100/60">
                <div className="flex items-center gap-2.5">
                  <EyeOff size={15} className={isAnonymous ? "text-violet-600" : "text-zinc-400"} />
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">Anonymous brainstorming</p>
                    <p className="text-xs text-zinc-500">Author names are hidden during ideation</p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`h-6 w-11 rounded-full transition ${isAnonymous ? "bg-violet-500" : "bg-zinc-200"}`} />
                  <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isAnonymous ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </label>

              <div className="mt-6 flex justify-end gap-3 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <SubmitButton />
              </div>
            </form>
          </>
        )}
      </dialog>
    </>
  );
}
