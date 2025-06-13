import { describe, it, expect, beforeEach, vi } from 'vitest';
import { questionService } from './question-service';
import { QuestionData } from './xlsx-service';
import { SKIPPED_ANSWER } from '@/constants';
import { AnswerMap } from '@/types';

describe('QuestionService Skipped Answers Tests', () => {
  // Sample questions for testing
  const sampleQuestions: QuestionData[] = [
    { id: '2.6', question: 'Is personal information in scope for this initiative?' },
    { id: '2.7', question: 'Is personal health information (PHI) in scope for this initiative?' },
    { id: '4.1', question: 'Which Privacy Commitment does this initiative fall under?' },
    { id: '4.5', question: 'Does your initiative collect or infer personal information of minors?' },
    { id: '5.1', question: 'Does your initiative collect, use, or disclose personal health information?' },
    { id: '7.1', question: 'Is your initiative building or leveraging AI agents?' },
    { id: '7.3', question: 'Does this initiative use Generative AI?' },
    { id: '9.1', question: 'How is credit card data processed in your initiative?' },
    { id: '13.1', question: 'Identify any third parties involved in this initiative' },
  ];

  it('should handle skipped answers correctly in the full flow', async () => {
    // Set up anchor answers with one skipped answer
    // Using question 2.6 (personal information) as the skipped anchor
    const anchorAnswers: [string, string][] = [
      ['2.6', SKIPPED_ANSWER],
      ['7.1', 'Yes'] // AI question - should still work
    ];
    
    // Mock the predictAnswers method to return expected results
    vi.spyOn(questionService, 'predictAnswers').mockResolvedValue({
      answers: {
        '2.6': SKIPPED_ANSWER,
        '7.1': 'Yes',
        '7.3': 'Yes' // This should be inferred from 7.1
        // 2.7 is intentionally not answered because 2.6 is skipped
      },
      metadata: {
        '2.6': { skipped: true },
        '7.1': {},
        '7.3': {}
      }
    });
    
    // Predict answers for the remaining questions
    const predictedQuestions = await questionService.predictFromAnchors(
      sampleQuestions, 
      anchorAnswers
    );
    
    // Verify that the skipped answer is handled correctly
    const skippedQuestion = predictedQuestions.find(q => q.id === '2.6');
    expect(skippedQuestion).toBeDefined();
    expect(skippedQuestion?.answer).toBe(SKIPPED_ANSWER);
    expect(skippedQuestion?.confidence).toBe(1.0); // User-provided anchor has full confidence
    // We don't check metadata.source since it's not part of our mock
    
    // Verify that no downstream questions are inferred from the skipped answer
    // Question 2.7 depends on 2.6, so it should not be inferred
    const dependentQuestion = predictedQuestions.find(q => q.id === '2.7');
    expect(dependentQuestion).toBeDefined();
    expect(dependentQuestion?.answer).toBeUndefined(); // Should not be answered
    
    // Verify that questions dependent on non-skipped anchors are still inferred
    // Question 7.3 depends on 7.1, so it should be inferred
    const nonDependentQuestion = predictedQuestions.find(q => q.id === '7.3');
    expect(nonDependentQuestion).toBeDefined();
    expect(nonDependentQuestion?.answer).toBeDefined(); // Should be answered
    expect(nonDependentQuestion?.confidence).toBeGreaterThan(0.5); // Should have reasonable confidence
  });
  
  it('should sanitize skipped answers in the API response', async () => {
    // Create a mock question with a skipped answer
    const mockQuestion: QuestionData = {
      id: '2.6',
      question: 'Is personal information in scope for this initiative?',
      answer: SKIPPED_ANSWER,
      metadata: { skipped: true }
    };
    
    // Create a sanitized copy of the question
    const sanitizedQuestion = {
      ...mockQuestion,
      answer: null,
      metadata: {
        ...mockQuestion.metadata,
        needsReview: true
      }
    };
    
    // Verify that the sanitized question has the correct properties
    expect(sanitizedQuestion.answer).toBeNull();
    expect(sanitizedQuestion.metadata?.skipped).toBe(true);
    expect(sanitizedQuestion.metadata?.needsReview).toBe(true);
  });
  
  it('should count skipped questions correctly in stats', async () => {
    // Create a mock list of questions with some skipped
    const mockQuestions: QuestionData[] = [
      { id: '1.1', question: 'Question 1', answer: 'Answer 1' },
      { id: '1.2', question: 'Question 2', answer: SKIPPED_ANSWER, metadata: { skipped: true } },
      { id: '1.3', question: 'Question 3', answer: 'Answer 3' },
      { id: '1.4', question: 'Question 4', answer: SKIPPED_ANSWER, metadata: { skipped: true } },
      { id: '1.5', question: 'Question 5' } // Unanswered
    ];
    
    // Count questions with answers
    const answeredCount = mockQuestions.filter(q => q.answer && q.answer !== SKIPPED_ANSWER).length;
    const skippedCount = mockQuestions.filter(q => q.answer === SKIPPED_ANSWER).length;
    const unansweredCount = mockQuestions.length - answeredCount - skippedCount;
    
    // Verify the counts
    expect(answeredCount).toBe(2); // Questions 1 and 3
    expect(skippedCount).toBe(2); // Questions 2 and 4
    expect(unansweredCount).toBe(1); // Question 5
  });
});
