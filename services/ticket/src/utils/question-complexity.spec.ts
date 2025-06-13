import { describe, it, expect } from 'vitest';
import { analyzeQuestionComplexity, getThinkingMessage, ComplexityLevel } from './question-complexity';

describe('analyzeQuestionComplexity', () => {
  it('should identify simple questions', () => {
    const simpleQuestions = [
      'What is DEP?',
      'How do I start?',
      'Who should I contact?',
      'Where can I find the DEP form?',
    ];

    simpleQuestions.forEach(question => {
      const result = analyzeQuestionComplexity(question);
      expect(result.level).toBe(ComplexityLevel.SIMPLE);
      expect(result.recommendedDelay).toBe(0);
    });
  });

  it('should identify moderate complexity questions', () => {
    const moderateQuestions = [
      'What are the steps to complete a DEP assessment for a project with third-party data?',
      'How does the approval process work for DEP assessments with multiple business units?',
      'Can you explain how to handle personal information in the DEP process?',
      'What is the relationship between data classification and risk assessment in the DEP?',
    ];

    moderateQuestions.forEach(question => {
      const result = analyzeQuestionComplexity(question);
      expect(result.level).toBe(ComplexityLevel.MODERATE);
      expect(result.recommendedDelay).toBeGreaterThan(0);
    });
  });

  it('should identify complex questions', () => {
    const complexQuestions = [
      'What is the process for handling a DEP that involves multiple business units with different data stewards, third-party integration, and personal health information that requires regulatory compliance?',
      'Can you compare the different approaches to risk assessment when dealing with personal information, third-party data, and regulatory compliance requirements in a DEP that spans multiple business units?',
      'How does the workflow for DEP approval change when we have multiple data stewards, security controls for restricted data, and integration with third-party systems that process personal health information?',
      'What if we need to implement a DEP for a project that involves artificial intelligence processing personal information across multiple business units with different data classification requirements and third-party data sharing?',
    ];

    complexQuestions.forEach(question => {
      const result = analyzeQuestionComplexity(question);
      expect(result.level).toBe(ComplexityLevel.COMPLEX);
      expect(result.recommendedDelay).toBeGreaterThan(1000);
    });
  });

  it('should consider question length as a factor', () => {
    const shortQuestion = 'What is DEP?';
    const longQuestion = 'What is DEP? '.repeat(10); // Same question repeated to make it longer

    const shortResult = analyzeQuestionComplexity(shortQuestion);
    const longResult = analyzeQuestionComplexity(longQuestion);

    expect(longResult.score).toBeGreaterThan(shortResult.score);
    expect(longResult.factors).toContain('Long question length');
  });

  it('should consider DEP terminology as a factor', () => {
    const noTermsQuestion = 'How do I get started with the process?';
    const manyTermsQuestion = 'How do I handle data classification, risk assessment, and third-party compliance in the DEP process?';

    const noTermsResult = analyzeQuestionComplexity(noTermsQuestion);
    const manyTermsResult = analyzeQuestionComplexity(manyTermsQuestion);

    expect(manyTermsResult.score).toBeGreaterThan(noTermsResult.score);
    expect(manyTermsResult.factors).toContain('Some complex DEP terms');
  });

  it('should consider multiple questions as a factor', () => {
    const singleQuestion = 'What is the DEP process?';
    const multipleQuestions = 'What is the DEP process? How do I start it? Who needs to approve it?';

    const singleResult = analyzeQuestionComplexity(singleQuestion);
    const multipleResult = analyzeQuestionComplexity(multipleQuestions);

    expect(multipleResult.score).toBeGreaterThan(singleResult.score);
    expect(multipleResult.factors).toContain('Multiple questions in one');
  });

  it('should consider analytical patterns as a factor', () => {
    const factualQuestion = 'What is the DEP process?';
    const analyticalQuestion = 'What is the relationship between data classification and risk assessment in the DEP process?';

    const factualResult = analyzeQuestionComplexity(factualQuestion);
    const analyticalResult = analyzeQuestionComplexity(analyticalQuestion);

    expect(analyticalResult.score).toBeGreaterThan(factualResult.score);
    expect(analyticalResult.factors).toContain('Analytical/comparative question');
  });
});

describe('getThinkingMessage', () => {
  it('should return appropriate message for SIMPLE complexity', () => {
    const message = getThinkingMessage(ComplexityLevel.SIMPLE);
    expect(message).toBe('Processing...');
  });

  it('should return appropriate message for MODERATE complexity', () => {
    const message = getThinkingMessage(ComplexityLevel.MODERATE);
    expect(message).toBe('Thinking about this...');
  });

  it('should return appropriate message for COMPLEX complexity', () => {
    const message = getThinkingMessage(ComplexityLevel.COMPLEX);
    expect(message).toBe('Analyzing this complex question...');
  });
});
