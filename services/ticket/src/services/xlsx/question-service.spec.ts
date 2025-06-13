import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from './question-service';
import { QuestionData } from './xlsx-service';
import { AnswerMap } from '@/types';
import * as questionsModule from '@/ai/prompts/questions';

// Mock the logger to avoid console output during tests
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('QuestionService', () => {
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

  // Sample anchor answers for testing
  const sampleAnchorAnswers: [string, string][] = [
    ['2.6', 'Yes'],
    ['2.7', 'No'],
    ['7.1', 'Yes'],
    ['9.1', 'Not applicable / No credit card data involved'],
    ['13.1', 'No third parties'],
  ];

  describe('selectAnchorQuestions', () => {
    it('should select anchor questions based on priority', () => {
      const result = questionService.selectAnchorQuestions(sampleQuestions, [], 5);
      
      // Verify that the selected questions include high-priority anchor questions
      expect(result.some(q => q.id === '2.6')).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should exclude questions that already have answers', () => {
      const existingAnswers: [string, string][] = [
        ['2.6', 'Yes'],
        ['7.1', 'No'],
      ];
      
      const result = questionService.selectAnchorQuestions(sampleQuestions, existingAnswers, 5);
      
      // Verify that questions with existing answers are excluded
      expect(result.some(q => q.id === '2.6')).toBe(false);
      expect(result.some(q => q.id === '7.1')).toBe(false);
    });
  });
});
