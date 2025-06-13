import { QuestionPrompt } from '@/types';

/**
 * Defines the exact 7 anchor questions for the DEP questionnaire as specified in the PDF
 * These are high-impact questions from key branching points in the DEP
 */
export const ANCHORS = [
  "2.6",  // PI in scope?
  "2.7",  // PHI in scope?
  "13.1", // Third-party vendors
  "9.1",  // Credit-card/payment data
  "7.1",  // AI/ML usage
  "7.3",  // Generative AI usage
  "SECTION_REGIMES" // Regulatory regimes (Quebec, GDPR, HIPAA; Sections 10–12)
];

/**
 * Enhanced anchor questions with detailed context and exact question text
 * These are used for prompting the user with clear context about why each question matters
 */
export const anchorQuestionPrompts: QuestionPrompt[] = [
  {
    id: "2.6",
    label: "Personal Information in Scope",
    context: "We need to know if PI is in scope so we can determine if the Privacy & Consent sections (Clusters 4 & 5) are required.",
    questionText: "Does the initiative involve Personal Information (PI)? Please list all types of personal information in scope, such as name, email, SIN, health history, etc.",
    options: ["Yes", "No"]
  },
  {
    id: "2.7",
    label: "Personal Health Information in Scope",
    context: "PHI is sensitive data subject to stricter rules and specific sections in the DEP (Section 5 and potentially Section 12).",
    questionText: "Does the initiative involve Personal Health Information (PHI)? PHI is a subset of personal information that relates to an individual's physical or mental health, including information about health services provided to them.",
    options: ["Yes", "No"]
  },
  {
    id: "13.1",
    label: "Third-Party Involvement",
    context: "Third-party involvement triggers the assessment of vendor risk, opening up the entire Section 13.",
    questionText: "Please identify any third parties involved in this initiative. This includes vendors, partners, contractors, or any external organizations that will have access to TELUS data or systems.",
    options: ["No third parties", "Yes, one third party", "Yes, multiple third parties"]
  },
  {
    id: "9.1",
    label: "Credit Card Data Processing",
    context: "Handling credit card data necessitates compliance with PCI standards, making Section 9 relevant.",
    questionText: "How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? Please select the most appropriate option.",
    options: ["TELUS internal payment system (Avalon/EPS)", "Third-party service provider", "Not applicable / No credit card data involved"]
  },
  {
    id: "7.1",
    label: "AI Agents Usage",
    context: "AI/ML usage activates the dedicated Section 7 on AI risks and considerations.",
    questionText: "Is your initiative building or leveraging any AI agents (i.e. Agentic AI) in this implementation? AI agents are systems that can make autonomous decisions or take actions on behalf of users.",
    options: ["Yes", "No"]
  },
  {
    id: "7.3",
    label: "Generative AI Usage",
    context: "Generative AI has specific sub-questions within the AI section (Q7.15–7.22) and unique risks to address.",
    questionText: "Does this initiative use Generative AI? Generative AI refers to artificial intelligence systems that can generate new content, such as text, images, audio, or video, in response to prompts or based on patterns learned from training data.",
    options: ["Yes", "No"]
  },
  {
    id: "SECTION_REGIMES",
    label: "Regulatory Regimes",
    context: "Applicable regional laws (Quebec, GDPR, HIPAA) determine the need for specific compliance sections (10, 11, 12).",
    questionText: "Which special regulatory regimes apply to this initiative? Please select all that apply to your project's data processing activities and jurisdictions.",
    options: ["Quebec's Law 25", "GDPR (EU)", "HIPAA (US health)", "None of these"]
  }
];

/**
 * Get an anchor question prompt by ID
 * @param id - The question ID to find
 * @returns The question prompt, or undefined if not found
 */
export function getAnchorPromptById(id: string): QuestionPrompt | undefined {
  return anchorQuestionPrompts.find(q => q.id === id);
}
