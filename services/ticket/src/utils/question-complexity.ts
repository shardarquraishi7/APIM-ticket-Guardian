/**
 * Utility for analyzing question complexity and determining appropriate response delays
 */

export enum ComplexityLevel {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex',
}

export interface ComplexityAnalysis {
  level: ComplexityLevel;
  score: number; // 0-100 score
  factors: string[]; // Reasons for the complexity assessment
  recommendedDelay: number; // Delay in milliseconds
}

/**
 * Analyzes the complexity of a question and recommends an appropriate delay
 * @param question The user's question text
 * @returns ComplexityAnalysis object with complexity assessment and recommended delay
 */
export function analyzeQuestionComplexity(question: string): ComplexityAnalysis {
  // Initialize score
  let complexityScore = 0;
  const factors: string[] = [];
  
  // Factor 1: Question length (longer questions tend to be more complex)
  const wordCount = question.split(/\s+/).length;
  if (wordCount > 30) {
    complexityScore += 25;
    factors.push('Long question length');
  } else if (wordCount > 15) {
    complexityScore += 15;
    factors.push('Moderate question length');
  }
  
  // Factor 2: Presence of complex DEP terminology
  const complexTerms = [
    'risk assessment', 'data classification', 'third-party', 'compliance',
    'multiple business units', 'data steward', 'implementation', 'workflow',
    'integration', 'security controls', 'privacy impact', 'regulatory',
    'personal information', 'data enablement plan', 'questionnaire', 'onetrust',
    'approval process', 'data governance', 'privacy assessment', 'security assessment'
  ];
  
  const termMatches = complexTerms.filter(term => 
    question.toLowerCase().includes(term.toLowerCase())
  );
  
  if (termMatches.length > 3) {
    complexityScore += 30;
    factors.push('Multiple complex DEP terms');
  } else if (termMatches.length > 1) {
    complexityScore += 15;
    factors.push('Some complex DEP terms');
  }
  
  // Factor 3: Question structure complexity
  if (question.includes('?') && question.split('?').length > 2) {
    complexityScore += 20;
    factors.push('Multiple questions in one');
  }
  
  // Factor 4: Comparative or analytical questions
  const analyticalPatterns = [
    'compare', 'difference between', 'how does', 'why would', 
    'what if', 'explain how', 'relationship between', 'process for',
    'steps to', 'best practice', 'recommend', 'should i', 'when should'
  ];
  
  if (analyticalPatterns.some(pattern => question.toLowerCase().includes(pattern))) {
    complexityScore += 20;
    factors.push('Analytical/comparative question');
  }
  
  // Determine complexity level
  let level = ComplexityLevel.SIMPLE;
  let recommendedDelay = 0;
  
  if (complexityScore >= 60) {
    level = ComplexityLevel.COMPLEX;
    recommendedDelay = 2500; // 2.5 seconds
  } else if (complexityScore >= 30) {
    level = ComplexityLevel.MODERATE;
    recommendedDelay = 1200; // 1.2 seconds
  }
  
  return {
    level,
    score: complexityScore,
    factors,
    recommendedDelay,
  };
}

/**
 * Gets an appropriate thinking message based on complexity level
 * @param complexityLevel The complexity level of the question
 * @returns A message to display while the AI is "thinking"
 */
export function getThinkingMessage(complexityLevel: ComplexityLevel): string {
  switch (complexityLevel) {
    case ComplexityLevel.COMPLEX:
      return "Analyzing this complex question...";
    case ComplexityLevel.MODERATE:
      return "Thinking about this...";
    default:
      return "Processing...";
  }
}
