export const assessmentRoleSlugs = [
  "designer",
  "finance-manager",
  "web3-marketing-manager",
] as const;

export type AssessmentRoleSlug = (typeof assessmentRoleSlugs)[number];

export const assessmentDurationMs = 30 * 60 * 1000;
export const assessmentMinAnswerLength = 20;

const assessmentQuestionsBySlug: Record<AssessmentRoleSlug, string[]> = {
  designer: [
    "Review a Web3 product screen and identify the top UX problems.",
    "Explain how to improve trust and conversion on a landing page.",
    "Describe a good onboarding flow for a new Web3 user.",
    "Explain how to simplify a complex wallet or digital-asset action for normal users.",
    "Identify visual hierarchy problems from a sample page.",
    "Suggest responsive design improvements for mobile users.",
    "Explain how to organize a Figma design system for developers.",
    "Describe how to design empty states, error states, and loading states.",
    "Explain how to balance Web3 visual style with professional product credibility.",
    "Provide a short design improvement plan for a sample NodeMeta product page.",
  ],
  "finance-manager": [
    "Analyze a simple monthly expense table and identify the biggest financial risks.",
    "Explain how to build a 3-month cash-flow forecast for a startup.",
    "Describe what controls should exist before approving contractor payments.",
    "Recommend cost-control actions for a growing Web3 company.",
    "Explain how to report runway and burn rate to leadership.",
    "Describe how to manage finance documentation for a remote team.",
    "Identify errors or missing information in a sample invoice/payment scenario.",
    "Explain how to separate business expenses, vendor payments, and project budgets.",
    "Describe how to communicate financial risk without overcomplicating the message.",
    "Provide a short finance action plan for NodeMeta's next 30 days.",
  ],
  "web3-marketing-manager": [
    "Create a short 30-day campaign plan for a NodeMeta Web3 product launch.",
    "Explain how to grow a Telegram or Discord community with high-quality users.",
    "Write a short positioning message for a Web3 product with technical features.",
    "Identify the best channels for reaching Web3 users and explain why.",
    "Describe how to measure marketing campaign success.",
    "Suggest a partnership strategy for a Web3 gaming or digital-asset product.",
    "Explain how to handle low engagement after a campaign launch.",
    "Create a simple influencer or ambassador campaign idea.",
    "Explain how to build trust for a new Web3 brand.",
    "Provide a short marketing action plan for NodeMeta's next 30 days.",
  ],
};

export function isAssessmentRole(slug: string): slug is AssessmentRoleSlug {
  return assessmentRoleSlugs.includes(slug as AssessmentRoleSlug);
}

export function getAssessmentQuestions(slug: AssessmentRoleSlug): string[] {
  return assessmentQuestionsBySlug[slug];
}

export function getAssessmentTrackLabel(slug: AssessmentRoleSlug): string {
  switch (slug) {
    case "designer":
      return "Design";
    case "finance-manager":
      return "Finance";
    case "web3-marketing-manager":
      return "Marketing";
  }
}
