"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { MEETING_TEMPLATES, type TemplateType } from "@/lib/templates";

type Props = {
  templateType: TemplateType;
  stage: "ideation" | "decision" | "summary";
};

export default function TemplateGuidePanel({ templateType, stage }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const template = MEETING_TEMPLATES[templateType];
  const guide = template.guide;

  const stageContent =
    stage === "ideation"
      ? guide.ideation
      : stage === "decision"
      ? guide.decision
      : guide.summary;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/60">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-800">
            {template.emoji} {template.label} — {stage} guide
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={15} className="text-amber-500" />
        ) : (
          <ChevronDown size={15} className="text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-amber-200/60 px-4 py-3">
          {Array.isArray(stageContent) ? (
            <ul className="space-y-1.5">
              {stageContent.map((prompt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-700">
                    {i + 1}
                  </span>
                  {prompt}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-amber-900">{stageContent}</p>
          )}
        </div>
      )}
    </div>
  );
}
