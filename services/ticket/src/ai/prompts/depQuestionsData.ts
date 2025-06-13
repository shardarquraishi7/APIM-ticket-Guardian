/**
 * Knowledge base for DEP questions and answer prediction
 * This file contains information about DEP questions, their relationships,
 * and strategies for predicting answers based on anchor questions.
 */

// Key anchor questions for DEP prediction
export const anchorQuestions = [
  {
    id: "2.6 Is personal information in scope for this initiative? (Single selection allowed) *",
    questionText: "Does the initiative involve Personal Information (PI)? Please list all types of personal information in scope, such as name, email, SIN, health history, etc.",
    explanation: "We need to know if PI is in scope so we can determine if the Privacy & Consent sections (Clusters 4 & 5) are required.",
    options: ["Yes", "No"],
    priority: 1
  },
  {
    id: "2.7 Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *",
    questionText: "Does the initiative involve Personal Health Information (PHI)? PHI is a subset of personal information that relates to an individual's physical or mental health, including information about health services provided to them.",
    explanation: "PHI is sensitive data subject to stricter rules and specific sections in the DEP (Section 5 and potentially Section 12).",
    options: ["Yes", "No"],
    priority: 2
  },
  {
    id: "13.1 Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *",
    questionText: "Please identify any third parties involved in this initiative. This includes vendors, partners, contractors, or any external organizations that will have access to TELUS data or systems.",
    explanation: "Third-party involvement triggers the assessment of vendor risk, opening up the entire Section 13.",
    options: ["No third parties", "Yes, one third party", "Yes, multiple third parties"],
    priority: 3
  },
  {
    id: "9.1 How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *",
    questionText: "How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? Please select the most appropriate option.",
    explanation: "Handling credit card data necessitates compliance with PCI standards, making Section 9 relevant.",
    options: ["TELUS internal payment system (Avalon/EPS)", "Third-party service provider", "Not applicable / No credit card data involved"],
    priority: 4
  },
  {
    id: "7.1 Is your initiative building or leveraging AI agents? (Single selection allowed) *",
    questionText: "Is your initiative building or leveraging any AI agents (i.e. Agentic AI) in this implementation? AI agents are systems that can make autonomous decisions or take actions on behalf of users.",
    explanation: "AI/ML usage activates the dedicated Section 7 on AI risks and considerations.",
    options: ["Yes", "No"],
    priority: 5
  },
  {
    id: "7.3 Does this initiative use Generative AI? (Single selection allowed) *",
    questionText: "Does this initiative use Generative AI? Generative AI refers to artificial intelligence systems that can generate new content, such as text, images, audio, or video, in response to prompts or based on patterns learned from training data.",
    explanation: "Generative AI has specific sub-questions within the AI section (Q7.15–7.22) and unique risks to address.",
    options: ["Yes", "No"],
    priority: 6
  },
  {
    id: "11.1 General Data Protection Regulation (GDPR)",
    questionText: "Which special regulatory regimes apply to this initiative? Please select all that apply to your project's data processing activities and jurisdictions.",
    explanation: "Applicable regional laws (Quebec, GDPR, HIPAA) determine the need for specific compliance sections (10, 11, 12).",
    options: ["Quebec's Law 25", "GDPR (EU)", "HIPAA (US health)", "None of these"],
    multiSelect: true,
    priority: 7
  },
  {
    id: "4.5 Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *",
    questionText: "Does your initiative collect or infer personal information of minors (under the age of majority)? This includes any data about individuals who are under 18 or 19 years old, depending on the jurisdiction.",
    explanation: "Involvement of minors triggers specific consent and privacy requirements (Q4.5, Q5.19, Q5.20).",
    options: ["Yes", "No"],
    priority: 8,
    optional: true
  }
];

// Question bank for DEP questions
export const questionBank = {
  "1.1 Description *": "Please explain: The issue or opportunity the initiative intends to address What we are doing to address it Please attach any available background documentation (draft contract or SOW, business case, project plan, etc.)",
  "1.2 Director Sponsor *": "Please identify the sponsoring Director in the text box.",
  "1.3 Business Area (Multiple selections allowed) (Allows other) *": "Please select the business unit(s) involved in this initiative.",
  "2.6 Is personal information in scope for this initiative? (Single selection allowed) *": "Personal information is any information about an identifiable individual. This includes information that on its own can identify an individual (e.g., name, email address, phone number, photo, customer ID, etc.) and information that can identify an individual when combined with other information (e.g., opinions, evaluations, comments, status/class, etc.).",
  "2.7 Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *": "Personal health information (PHI) is a subset of personal information that relates to an individual's physical or mental health, including information about health services provided to them.",
  "2.9 Select the applicable data classification(s) in scope for this initiative (Multiple selections allowed) *": "Please select all applicable data classifications for the data in scope for this initiative.",
  "4.1 Which Privacy Commitment does this initiative fall under? (Multiple selections allowed) (Justification allowed) (Allows other) *": "Please select which Privacy Commitment(s) this initiative falls under.",
  "4.5 Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *": "Please indicate if your initiative collects or infers personal information of minors.",
  "7.1 Is your initiative building or leveraging AI agents? (Single selection allowed) *": "Please indicate if your initiative is building or leveraging AI agents.",
  "7.3 Does this initiative use Generative AI? (Single selection allowed) *": "Generative AI refers to artificial intelligence systems that can generate new content, such as text, images, audio, or video, in response to prompts or based on patterns learned from training data.",
  "8.1 Has this initiative been reviewed by TELUS Health Cyber Assurance for security certification compliance? (Single selection allowed) *": "Please indicate if this initiative has been reviewed by TELUS Health Cyber Assurance for security certification compliance.",
  "9.1 How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *": "Please indicate how credit card data is processed in your initiative.",
  "11.1 General Data Protection Regulation (GDPR)": "Please indicate if the GDPR applies to your initiative.",
  "13.1 Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *": "Please identify any third parties involved in this initiative."
};

// Option bank for DEP questions
export const optionBank = {
  "1.3 Business Area (Multiple selections allowed) (Allows other) *": [
    "Consumer Solutions",
    "Customer Experience",
    "Digital",
    "Finance",
    "Health",
    "Legal",
    "Marketing",
    "Network",
    "People & Culture",
    "Security",
    "Strategy & Business Transformation",
    "Technology"
  ],
  "2.6 Is personal information in scope for this initiative? (Single selection allowed) *": [
    "Yes",
    "No"
  ],
  "2.7 Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *": [
    "Yes",
    "No"
  ],
  "2.9 Select the applicable data classification(s) in scope for this initiative (Multiple selections allowed) *": [
    "Public",
    "Internal",
    "Confidential",
    "Restricted"
  ],
  "4.1 Which Privacy Commitment does this initiative fall under? (Multiple selections allowed) (Justification allowed) (Allows other) *": [
    "Commitment 1: We are accountable to you for how we collect, use and disclose your personal information.",
    "Commitment 2: We will be clear about how we collect, use and disclose your personal information.",
    "Commitment 3: We require your meaningful consent to collect, use and disclose your personal information.",
    "Commitment 4: We limit our collection of your personal information.",
    "Commitment 5: We use or disclose your personal information for the reason it was collected.",
    "Commitment 6: We keep your personal information for only as long as necessary.",
    "Commitment 7: We keep your personal information accurate and complete.",
    "Commitment 8: We use appropriate safeguards to protect your personal information.",
    "Commitment 9: We are open about our privacy practices and you can access your personal information."
  ],
  "4.5 Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *": [
    "Yes",
    "No"
  ],
  "7.1 Is your initiative building or leveraging AI agents? (Single selection allowed) *": [
    "Yes",
    "No"
  ],
  "7.3 Does this initiative use Generative AI? (Single selection allowed) *": [
    "Yes",
    "No"
  ],
  "8.1 Has this initiative been reviewed by TELUS Health Cyber Assurance for security certification compliance? (Single selection allowed) *": [
    "Yes",
    "No",
    "Not Applicable"
  ],
  "9.1 How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *": [
    "TELUS internal payment system (Avalon/EPS)",
    "Third-party service provider",
    "Not applicable / No credit card data involved"
  ],
  "11.1 General Data Protection Regulation (GDPR)": [
    "Quebec's Law 25",
    "GDPR (EU)",
    "HIPAA (US health)",
    "None of these"
  ],
  "13.1 Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *": [
    "No third parties",
    "Yes, one third party",
    "Yes, multiple third parties"
  ]
};

// DEP knowledge base - key prediction rules
export const predictionRules = {
  // If personal information is not in scope, most privacy questions are not applicable
  personalInformation: {
    condition: { questionId: "2.6", answer: "No" },
    affects: ["4.*", "5.*"],
    defaultAnswer: "Not Applicable"
  },
  
  // If PHI is in scope, stricter controls are needed
  personalHealthInformation: {
    condition: { questionId: "2.7", answer: "Yes" },
    affects: ["5.*", "12.*"],
    defaultAnswer: "Yes" // Most PHI controls should be in place
  },
  
  // If no third parties are involved, third-party risk questions are not applicable
  thirdPartyInvolvement: {
    condition: { questionId: "13.1", answer: "No third parties" },
    affects: ["13.*"],
    defaultAnswer: "Not Applicable"
  },
  
  // If no credit card data is processed, PCI questions are not applicable
  creditCardData: {
    condition: { questionId: "9.1", answer: "Not applicable / No credit card data involved" },
    affects: ["9.*"],
    defaultAnswer: "Not Applicable"
  },
  
  // If AI is not used, AI-related questions are not applicable
  aiUsage: {
    condition: { questionId: "7.1", answer: "No" },
    affects: ["7.*"],
    defaultAnswer: "Not Applicable"
  },
  
  // If GenAI is used, specific GenAI questions need answers
  genAiUsage: {
    condition: { questionId: "7.3", answer: "Yes" },
    affects: ["7.15", "7.16", "7.17", "7.18", "7.19", "7.20", "7.21", "7.22"],
    requiresSpecificAnswers: true
  }
};

import { Section } from '@/types';

// Section relationships for DEP questions
export const sectionRelationships = [
  { section: Section.ProjectInfo, description: "Project Information", relatedTo: [Section.DataScope] },
  { section: Section.DataScope, description: "Data Flow and Classification", relatedTo: [Section.DataRetention, Section.Privacy, Section.HealthData, Section.Security] },
  { section: Section.DataRetention, description: "Data Retention", relatedTo: [Section.DataScope] },
  { section: Section.Privacy, description: "Privacy", relatedTo: [Section.DataScope, Section.HealthData] },
  { section: Section.HealthData, description: "Personal Health Information", relatedTo: [Section.DataScope, Section.Privacy, Section.HIPAA] },
  { section: Section.AI_ML, description: "AI and Automation", relatedTo: [] },
  { section: Section.Security, description: "Security", relatedTo: [Section.DataScope] },
  { section: Section.PaymentCard, description: "Payment Card Industry", relatedTo: [] },
  { section: Section.QuebecLaw25, description: "Quebec's Law 25", relatedTo: [Section.Privacy] },
  { section: Section.GDPR, description: "GDPR", relatedTo: [Section.Privacy] },
  { section: Section.HIPAA, description: "HIPAA", relatedTo: [Section.HealthData] },
  { section: Section.VendorRisk, description: "Third-Party Risk", relatedTo: [Section.DataScope, Section.Security] }
];

// Import the section-service for centralized section relationships
// This is a more type-safe way to work with section relationships
export { sectionRelations } from '@/services/section-service';
