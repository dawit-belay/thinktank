export const MEETING_TEMPLATES = {
  retrospective: {
    label: "Retrospective",
    emoji: "🔄",
    description: "Reflect on what went well, what didn't, and what to improve",
    defaultTitle: "Team Retrospective",
    guide: {
      ideation: [
        "What went well this sprint or period?",
        "What didn't go well or caused friction?",
        "What should we change, stop, or try next time?",
      ],
      decision: "Prioritise the top improvements to action on.",
      summary: "Key commitments and owners for the next sprint.",
    },
  },
  okr_planning: {
    label: "OKR Planning",
    emoji: "🎯",
    description: "Define objectives and key results for the next period",
    defaultTitle: "OKR Planning Session",
    guide: {
      ideation: [
        "What objectives should we pursue this quarter?",
        "What key results would indicate success?",
        "What blockers or risks should we anticipate?",
      ],
      decision: "Finalise the OKRs and assign owners for each.",
      summary: "Agreed OKRs, owners, and review cadence.",
    },
  },
  standup: {
    label: "Weekly Standup",
    emoji: "📋",
    description: "Share updates, blockers, and weekly priorities as a team",
    defaultTitle: "Weekly Standup",
    guide: {
      ideation: [
        "What did you complete last week?",
        "What are your top priorities this week?",
        "Any blockers or help needed from the team?",
      ],
      decision: "Team priorities and blockers to address this week.",
      summary: "Weekly commitments and action items agreed.",
    },
  },
  decision_log: {
    label: "Decision Log",
    emoji: "⚖️",
    description: "Evaluate options and document an important decision",
    defaultTitle: "Decision: [Topic]",
    guide: {
      ideation: [
        "What problem are we solving or decision are we making?",
        "What are the available options or approaches?",
        "What are the trade-offs, risks, or constraints for each?",
      ],
      decision: "The chosen option and the reasoning behind it.",
      summary: "Decision made, next steps, and who is responsible.",
    },
  },
} as const;

export type TemplateType = keyof typeof MEETING_TEMPLATES;

export const TEMPLATE_LIST = Object.entries(MEETING_TEMPLATES).map(
  ([key, value]) => ({ key: key as TemplateType, ...value })
);
