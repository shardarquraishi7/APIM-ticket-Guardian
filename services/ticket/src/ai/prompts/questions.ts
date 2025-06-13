import { Question, Section, AnswerMap } from '@/types';
import { SKIPPED_ANSWER } from '@/constants';

// Define the questions using the new Question interface
export const questions: Question[] = [
  // Section 2: Data Scope & Classification
  {
    id: "2.6",
    text: "Is personal information in scope for this initiative? (Single selection allowed) *",
    section: Section.DataScope,
    options: ["Yes", "No"],
    priority: 1,
    explanation: "This question is a pivotal gatekeeper for the majority of privacy-related questions in the DEP."
  },
  {
    id: "2.7",
    text: "Is personal health information (PHI) in scope for this initiative? (Single selection allowed) *",
    section: Section.DataScope,
    options: ["Yes", "No"],
    priority: 2,
    explanation: "PHI is sensitive data subject to stricter rules.",
    dependsOn: ["2.6"],
    infer: (answers: AnswerMap) => {
      if (answers["2.6"] === SKIPPED_ANSWER) return undefined;
      if (answers["2.6"] === "No") {
        return "No";
      }
      return undefined;
    }
  },
  
  // Section 4: Privacy
  {
    id: "4.1",
    text: "Which Privacy Commitment does this initiative fall under? (Multiple selections allowed) (Justification allowed) (Allows other) *",
    section: Section.Privacy,
    options: [
      "Commitment 1: We are accountable to you for how we collect, use and disclose your personal information.",
      "Commitment 2: We will be clear about how we collect, use and disclose your personal information."
    ],
    multiSelect: true,
    dependsOn: ["2.6"],
    infer: (answers: AnswerMap) => {
      if (answers["2.6"] === SKIPPED_ANSWER) return undefined;
      if (answers["2.6"] === "No") {
        return "Not Applicable";
      }
      return undefined;
    }
  },
  {
    id: "4.5",
    text: "Does your initiative collect or infer personal information of minors (under the age of majority)? (Single selection allowed) *",
    section: Section.Privacy,
    options: ["Yes", "No"],
    priority: 8,
    optional: true,
    explanation: "Involvement of minors triggers specific consent and privacy requirements.",
    dependsOn: ["2.6"],
    infer: (answers: AnswerMap) => {
      if (answers["2.6"] === SKIPPED_ANSWER) return undefined;
      if (answers["2.6"] === "No") {
        return "Not Applicable";
      }
      return undefined;
    }
  },
  
  // Section 5: Personal Health Information
  {
    id: "5.1",
    text: "Does your initiative collect, use, or disclose personal health information? (Single selection allowed) *",
    section: Section.HealthData,
    options: ["Yes", "No"],
    dependsOn: ["2.6", "2.7"],
    infer: (answers: AnswerMap) => {
      if (answers["2.6"] === SKIPPED_ANSWER) return undefined;
      if (answers["2.7"] === SKIPPED_ANSWER) return undefined;
      
      if (answers["2.6"] === "No") {
        return "Not Applicable";
      }
      if (answers["2.7"] === "Yes") {
        return "Yes";
      }
      if (answers["2.7"] === "No") {
        return "No";
      }
      return undefined;
    }
  },
  
  // Section 7: AI and Machine Learning
  {
    id: "7.1",
    text: "Is your initiative building or leveraging AI agents? (Single selection allowed) *",
    section: Section.AI_ML,
    options: ["Yes", "No"],
    priority: 5,
    explanation: "AI/ML usage activates the dedicated Section 7 on AI risks and considerations."
  },
  {
    id: "7.3",
    text: "Does this initiative use Generative AI? (Single selection allowed) *",
    section: Section.AI_ML,
    options: ["Yes", "No"],
    priority: 6,
    explanation: "Generative AI has specific sub-questions within the AI section.",
    dependsOn: ["7.1"],
    infer: (answers: AnswerMap) => {
      // If the user explicitly skipped Q7.1, don't assume anything
      if (answers["7.1"] === SKIPPED_ANSWER) return undefined;
      
      // If no AI/ML is used, generative AI is definitely not used
      if (answers["7.1"] === "No") {
        return "No";  // Changed from "Not Applicable" to "No" for clarity
      }
      
      // If AI/ML is used, leave unanswered so the user can specify
      return undefined;
    }
  },
  
  // Section 9: Payment Card Industry
  {
    id: "9.1",
    text: "How is credit card data (including PAN, CVV, expiry date, etc.) processed in your initiative? (Single selection allowed) (Justification allowed) (Allows other) *",
    section: Section.PaymentCard,
    options: [
      "TELUS internal payment system (Avalon/EPS)",
      "Third-party service provider",
      "Not applicable / No credit card data involved"
    ],
    priority: 4,
    explanation: "Handling credit card data necessitates compliance with PCI standards."
  },
  
  // Section 13: Third-Party Risk
  {
    id: "13.1",
    text: "Identify any third parties involved in this initiative (Multiple selections allowed) (Justification allowed) (Allows other) *",
    section: Section.VendorRisk,
    options: [
      "No third parties",
      "Yes, one third party",
      "Yes, multiple third parties"
    ],
    priority: 3,
    explanation: "Third-party involvement triggers the assessment of vendor risk."
  }
];

// Export anchor questions separately for convenience
export const anchorQuestions = questions.filter(q => q.priority !== undefined)
  .sort((a, b) => (a.priority || 0) - (b.priority || 0));

// Helper function to get a question by ID
export function getQuestionById(id: string): Question | undefined {
  // First check in the local questions array
  const localQuestion = questions.find(q => q.id === id);
  if (localQuestion) return localQuestion;
  
  // If not found, try to find in depQuestionsData
  try {
    const { anchorQuestions: depAnchorQuestions } = require('./depQuestionsData');
    
    // First try exact match
    let depQuestion = depAnchorQuestions.find((q: any) => q.id === id);
    
    // If not found, try to match by the question number at the start of the ID
    if (!depQuestion && id.includes(" ")) {
      // Extract the question number (e.g., "2.7" from "2.7 Is personal health...")
      const questionNumberMatch = id.match(/^(\d+\.\d+)/);
      if (questionNumberMatch) {
        const questionNumber = questionNumberMatch[1];
        depQuestion = depAnchorQuestions.find((q: any) => 
          q.id.startsWith(questionNumber + " ")
        );
      }
    }
    
    // If still not found and the ID is just a number (e.g., "2.7"), try to match by that
    if (!depQuestion && !id.includes(" ")) {
      depQuestion = depAnchorQuestions.find((q: any) => 
        q.id.startsWith(id + " ")
      );
    }
    
    if (depQuestion) {
      // Convert from depQuestionsData format to Question format
      // Extract section number from the question ID (e.g., "2.6" -> Section.DataScope)
      const sectionMatch = depQuestion.id.match(/^(\d+)\./);
      const sectionNumber = sectionMatch ? sectionMatch[1] : "2"; // Default to DataScope
      
      return {
        id: depQuestion.id,
        text: depQuestion.questionText,
        section: sectionNumber as Section,
        options: depQuestion.options,
        explanation: depQuestion.explanation,
        priority: depQuestion.priority,
        multiSelect: depQuestion.multiSelect,
        optional: depQuestion.optional
      };
    }
  } catch (error) {
    console.error('Error loading depQuestionsData:', error);
  }
  
  return undefined;
}

// Helper function to get questions by section
export function getQuestionsBySection(section: Section): Question[] {
  return questions.filter(q => q.section === section);
}

  // Helper function to apply inference rules to questions
  export function applyInferenceRules(questions: Question[], answers: AnswerMap): AnswerMap {
    const inferredAnswers: AnswerMap = { ...answers };
    
    let changed: boolean;
    // Keep applying inference rules until no more changes are made
    do {
      changed = false;
      
      for (const question of questions) {
        // Skip questions that already have answers
        if (inferredAnswers[question.id] !== undefined) continue;
        
        // Skip questions without inference rules
        if (!question.infer) continue;
        
        // Apply the inference rule
        const inferredAnswer = question.infer(inferredAnswers);
        if (inferredAnswer !== undefined) {
          // Handle multi-select questions
          if (question.multiSelect && Array.isArray(inferredAnswer)) {
            // If there's an existing answer and it's an array, merge with it
            const existingAnswer = inferredAnswers[question.id];
            if (existingAnswer && Array.isArray(existingAnswer)) {
              inferredAnswers[question.id] = [...existingAnswer, ...inferredAnswer];
            } else {
              inferredAnswers[question.id] = inferredAnswer;
            }
          } else {
            inferredAnswers[question.id] = inferredAnswer;
          }
          changed = true;
        }
      }
    } while (changed);
    
    return inferredAnswers;
  }
