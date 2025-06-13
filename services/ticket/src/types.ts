export enum Section {
  ProjectInfo     = "1",
  DataScope       = "2",
  DataRetention   = "3",
  Privacy         = "4",
  HealthData      = "5",
  Security        = "6",
  AI_ML           = "7",
  CyberAssurance  = "8",
  PaymentCard     = "9",
  QuebecLaw25     = "10",
  GDPR            = "11",
  HIPAA           = "12",
  VendorRisk      = "13"
}

/** Maps each section to its related peer sections */
export interface SectionRelation {
  section: Section;
  relatedTo: Section[];
}

export interface AnswerMap {
  [questionId: string]: string | string[];
}

export interface Question {
  id: string;                         // e.g. "2.6"
  text: string;                       // full prompt
  section: Section;
  dependsOn?: string[];               // anchor IDs
  options?: string[];                 // if multiple choice
  infer?: (answers: AnswerMap) => string | string[] | undefined;
  priority?: number;                  // for anchor questions
  explanation?: string;               // explanation of the question
  multiSelect?: boolean;              // whether multiple options can be selected
  optional?: boolean;                 // whether the question is optional
  label?: string;                     // short summary of what this question is about
  context?: string;                   // explanation of why this question matters
  questionText?: string;              // exact text from the DEP spreadsheet
}

/**
 * Interface for enhanced question prompts with additional context
 */
export interface QuestionPrompt {
  id: string;                         // e.g. "2.6"
  label: string;                      // short summary of what this question is about
  context: string;                    // explanation of why this question matters
  questionText: string;               // exact text from the DEP spreadsheet
  options?: string[];                 // if multiple choice
}
