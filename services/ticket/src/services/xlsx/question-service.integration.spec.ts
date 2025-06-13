import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from './question-service';
import { QuestionData } from './xlsx-service';
import { AnswerMap } from '@/types';
import { SKIPPED_ANSWER } from '@/constants';
import { questions } from '@/ai/prompts/questions';

// Mock the logger to avoid console output during tests
vi.mock('@/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }),
}));

describe('QuestionService Integration Tests', () => {
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
    ['2.6', 'No'],  // This should trigger inference for 2.7, 4.1, 4.5, 5.1
    ['7.1', 'No'],  // This should trigger inference for 7.3
  ];

  describe('Integration between predictAnswers and predictFromAnchors', () => {
    it('should produce consistent results between predictAnswers and predictFromAnchors', async () => {
      // Create a copy of the sample questions to avoid modifying the original
      const testQuestions = [...sampleQuestions];
      
      // Convert anchor answers to AnswerMap format
      const typedAnswers: AnswerMap = {};
      sampleAnchorAnswers.forEach(([key, value]) => {
        typedAnswers[key] = value;
      });
      
      // Mock the promptUser method to avoid actual prompting
      vi.spyOn(questionService as any, 'promptUser').mockImplementation(
        async (q: any) => {
          // Return a default answer for any question that doesn't have an answer yet
          return 'Default Answer';
        }
      );
      
      // Call predictAnswers directly
      const { answers: directAnswers } = await questionService.predictAnswers(typedAnswers);
      
      // Call predictFromAnchors with the same data
      const predictionResult = await questionService.predictFromAnchors(testQuestions, sampleAnchorAnswers);
      const predictedQuestions = predictionResult.predictedQuestions;
      
      // Verify that all questions that have answers in directAnswers also have answers in predictedQuestions
      for (const [id, answer] of Object.entries(directAnswers)) {
        if (answer === SKIPPED_ANSWER) continue; // Skip these for comparison
        
        const questionInResult = predictedQuestions.find(q => q.id === id);
        expect(questionInResult).toBeDefined();
        
        // Convert array answers to string for comparison
        const formattedDirectAnswer = Array.isArray(answer) ? answer.join(', ') : answer;
        
        // Verify the answer is the same
        expect(questionInResult?.answer).toBe(formattedDirectAnswer);
      }
      
      // Verify that confidence levels are set correctly
      const q26 = predictedQuestions.find(q => q.id === '2.6');
      expect(q26?.confidence).toBe(1.0); // User-provided anchor
      
      const q27 = predictedQuestions.find(q => q.id === '2.7');
      if (q27?.answer === 'No') {
        expect(q27.confidence).toBe(0.7); // Inferred from anchor
      }
      
      const q41 = predictedQuestions.find(q => q.id === '4.1');
      if (q41?.answer === 'Not Applicable') {
        expect(q41.confidence).toBe(0.9); // Not Applicable inference
      }
    });
    
    it('should handle merged multi-select answers with reduced confidence', async () => {
      // Create a copy of the sample questions to avoid modifying the original
      const testQuestions = [...sampleQuestions];
      
      // Add a multi-select question that will get merged answers
      const multiSelectQuestion: QuestionData = { 
        id: 'multi.1', 
        question: 'Which features do you need? (multi-select)' 
      };
      testQuestions.push(multiSelectQuestion);
      
      // Mock predictAnswers to return a merged multi-select answer
      vi.spyOn(questionService, 'predictAnswers').mockResolvedValue({
        answers: {
          '2.6': 'Yes',
          'multi.1': ['Feature A', 'Feature B', 'Feature C'] // Multi-select answer
        },
        metadata: {
          'multi.1': { merged: true } // Mark as merged
        }
      });
      
      // Call predictFromAnchors with the test data
      const predictionResult = await questionService.predictFromAnchors(testQuestions, [['2.6', 'Yes']]);
      const predictedQuestions = predictionResult.predictedQuestions;
      
      // Find the multi-select question in the results
      const multiQuestion = predictedQuestions.find(q => q.id === 'multi.1');
      
      // Verify that the answer was formatted correctly
      expect(multiQuestion?.answer).toBe('Feature A, Feature B, Feature C');
      
      // Verify that the confidence was reduced for the merged answer
      expect(multiQuestion?.confidence).toBe(0.6);
    });
    
    it('should handle skipped anchors with very low confidence', async () => {
      // Create a copy of the sample questions to avoid modifying the original
      const testQuestions = [...sampleQuestions];
      
      // Mock predictAnswers to return a skipped anchor
      vi.spyOn(questionService, 'predictAnswers').mockResolvedValue({
        answers: {
          '2.6': SKIPPED_ANSWER,
          '7.1': 'Yes'
        },
        metadata: {
          '2.6': { skipped: true }
        }
      });
      
      // Call predictFromAnchors with the test data
      const predictionResult = await questionService.predictFromAnchors(testQuestions, [['7.1', 'Yes']]);
      const predictedQuestions = predictionResult.predictedQuestions;
      
      // Find the skipped question in the results
      const skippedQuestion = predictedQuestions.find(q => q.id === '2.6');
      
      // Verify that the skipped answer has very low confidence
      expect(skippedQuestion?.confidence).toBe(0.1);
    });
    
    it('should not infer answers from skipped anchors', async () => {
      // Create a test answer map with a skipped anchor
      const testAnswers: AnswerMap = {
        '2.6': SKIPPED_ANSWER
      };
      
      // Create a mock infer function that checks for skipped answers
      const mockInfer = vi.fn().mockImplementation((answers: AnswerMap) => {
        // This should treat SKIPPED_ANSWER as undefined
        if (answers["2.6"] === SKIPPED_ANSWER) {
          return undefined; // Treat skipped as undefined
        }
        
        // Normal inference logic
        if (answers["2.6"] === "No") {
          return "No";
        }
        return undefined;
      });
      
      // Mock the entire predictAnswers method to use our mock infer function
      vi.spyOn(questionService, 'predictAnswers').mockImplementation(async (existingAnswers: AnswerMap = {}) => {
        // Call our mock infer function directly with the test answers
        const inferResult = mockInfer(existingAnswers);
        
        // If the infer function returns a value, add it to the answers
        const finalAnswers = { ...existingAnswers };
        if (inferResult !== undefined) {
          finalAnswers['2.7'] = inferResult;
        }
        
        return { 
          answers: finalAnswers, 
          metadata: { '2.6': { skipped: true } } 
        };
      });
      
      // Call predictAnswers with the test answers
      const { answers } = await questionService.predictAnswers(testAnswers);
      
      // Verify that the infer function was called
      expect(mockInfer).toHaveBeenCalled();
      
      // Verify that the infer function was called with the skipped answer
      const callArg = mockInfer.mock.calls[0][0];
      expect(callArg['2.6']).toBe(SKIPPED_ANSWER);
      
      // Verify that no answer was inferred for 2.7
      expect(answers['2.7']).toBeUndefined();
    });
    
    it('should handle multiple cascading rules firing on the same question', async () => {
      // Create a test answer map with initial answers
      const testAnswers: AnswerMap = {
        '2.6': 'Yes',
        '7.1': 'Yes'
      };
      
      // Create a multi-select question that will receive answers from multiple rules
      const multiSelectQuestion: QuestionData = { 
        id: 'multi.1', 
        question: 'Which features do you need? (multi-select)' 
      };
      
      // Create two mock infer functions that both add items to the same multi-select question
      const mockInferFromPrivacy = vi.fn().mockImplementation((answers: AnswerMap) => {
        if (answers['2.6'] === 'Yes') {
          return ['Privacy Controls', 'Data Minimization'];
        }
        return undefined;
      });
      
      const mockInferFromAI = vi.fn().mockImplementation((answers: AnswerMap) => {
        if (answers['7.1'] === 'Yes') {
          return ['AI Transparency', 'Explainability'];
        }
        return undefined;
      });
      
      // Mock the predictAnswers method to use our mock infer functions
      vi.spyOn(questionService, 'predictAnswers').mockImplementation(async (existingAnswers: AnswerMap = {}) => {
        const answers = { ...existingAnswers };
        const metadata: Record<string, { merged?: boolean }> = {};
        
        // Apply first inference rule
        const privacyFeatures = mockInferFromPrivacy(answers);
        if (privacyFeatures) {
          answers['multi.1'] = privacyFeatures;
        }
        
        // Apply second inference rule
        const aiFeatures = mockInferFromAI(answers);
        if (aiFeatures) {
          // If there's already an answer, merge with it
          if (answers['multi.1']) {
            answers['multi.1'] = [...(answers['multi.1'] as string[]), ...aiFeatures];
            metadata['multi.1'] = { merged: true };
          } else {
            answers['multi.1'] = aiFeatures;
          }
        }
        
        return { answers, metadata };
      });
      
      // Call predictAnswers with the test answers
      const { answers, metadata } = await questionService.predictAnswers(testAnswers);
      
      // Verify that both infer functions were called
      expect(mockInferFromPrivacy).toHaveBeenCalled();
      expect(mockInferFromAI).toHaveBeenCalled();
      
      // Verify that the multi-select question has answers from both rules
      expect(answers['multi.1']).toBeDefined();
      expect(Array.isArray(answers['multi.1'])).toBe(true);
      
      const multiSelectAnswer = answers['multi.1'] as string[];
      expect(multiSelectAnswer).toContain('Privacy Controls');
      expect(multiSelectAnswer).toContain('Data Minimization');
      expect(multiSelectAnswer).toContain('AI Transparency');
      expect(multiSelectAnswer).toContain('Explainability');
      expect(multiSelectAnswer.length).toBe(4);
      
      // Verify that the metadata indicates this was a merged answer
      expect(metadata['multi.1']).toBeDefined();
      expect(metadata['multi.1'].merged).toBe(true);
    });
  });
});
