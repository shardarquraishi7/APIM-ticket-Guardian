import { describe, it, expect } from 'vitest';
import { questions, applyInferenceRules } from './questions';
import { AnswerMap } from '@/types';

describe('Question inference rules', () => {
  // Find specific questions by ID for testing
  const Q2_6 = questions.find(q => q.id === "2.6");
  const Q2_7 = questions.find(q => q.id === "2.7");
  const Q4_1 = questions.find(q => q.id === "4.1");
  const Q4_5 = questions.find(q => q.id === "4.5");
  const Q5_1 = questions.find(q => q.id === "5.1");
  const Q7_1 = questions.find(q => q.id === "7.1");
  const Q7_3 = questions.find(q => q.id === "7.3");

  it('should have all test questions defined', () => {
    expect(Q2_6).toBeDefined();
    expect(Q2_7).toBeDefined();
    expect(Q4_1).toBeDefined();
    expect(Q4_5).toBeDefined();
    expect(Q5_1).toBeDefined();
    expect(Q7_1).toBeDefined();
    expect(Q7_3).toBeDefined();
  });

  describe('Individual inference rules', () => {
    it('Q2_7 should infer "No" when Q2_6 is "No"', () => {
      expect(Q2_7?.infer).toBeDefined();
      expect(Q2_7?.infer!({ "2.6": "No" })).toBe("No");
    });

    it('Q2_7 should not infer anything when Q2_6 is "Yes"', () => {
      expect(Q2_7?.infer!({ "2.6": "Yes" })).toBeUndefined();
    });

    it('Q4_1 should infer "Not Applicable" when Q2_6 is "No"', () => {
      expect(Q4_1?.infer).toBeDefined();
      expect(Q4_1?.infer!({ "2.6": "No" })).toBe("Not Applicable");
    });

    it('Q4_5 should infer "Not Applicable" when Q2_6 is "No"', () => {
      expect(Q4_5?.infer).toBeDefined();
      expect(Q4_5?.infer!({ "2.6": "No" })).toBe("Not Applicable");
    });

    it('Q5_1 should infer correctly based on Q2_6 and Q2_7', () => {
      expect(Q5_1?.infer).toBeDefined();
      expect(Q5_1?.infer!({ "2.6": "No" })).toBe("Not Applicable");
      expect(Q5_1?.infer!({ "2.6": "Yes", "2.7": "Yes" })).toBe("Yes");
      expect(Q5_1?.infer!({ "2.6": "Yes", "2.7": "No" })).toBe("No");
    });

    it('Q7_3 should infer "No" when Q7_1 is "No", and leave it blank when Q7_1 is "Yes"', () => {
      expect(Q7_3?.infer).toBeDefined();
      expect(Q7_3?.infer!({ "7.1": "No" })).toBe("No");
      expect(Q7_3?.infer!({ "7.1": "Yes" })).toBeUndefined();
      expect(Q7_3?.infer!({ "7.1": "__SKIPPED__" })).toBeUndefined();
    });
  });

  describe('applyInferenceRules function', () => {
    it('should apply inference rules in cascade', () => {
      const initialAnswers: AnswerMap = {
        "2.6": "No"
      };

      const inferredAnswers = applyInferenceRules(questions, initialAnswers);
      
      // Check that Q2_7 was inferred from Q2_6
      expect(inferredAnswers["2.7"]).toBe("No");
      
      // Check that privacy questions were inferred from Q2_6
      expect(inferredAnswers["4.1"]).toBe("Not Applicable");
      expect(inferredAnswers["4.5"]).toBe("Not Applicable");
      
      // Check that health data questions were inferred from Q2_6 and Q2_7
      expect(inferredAnswers["5.1"]).toBe("Not Applicable");
    });

    it('should only infer answers when conditions are met', () => {
      // Test with answers that trigger only specific inference rules
      const initialAnswers: AnswerMap = {
        "2.6": "Yes",
        "2.7": "No",
        "7.1": "Yes"
      };

      const inferredAnswers = applyInferenceRules(questions, initialAnswers);
      
      // Privacy questions should not be inferred when 2.6 is "Yes"
      expect(inferredAnswers["4.1"]).toBeUndefined();
      expect(inferredAnswers["4.5"]).toBeUndefined();
      
      // 5.1 should be inferred as "No" when 2.6 is "Yes" and 2.7 is "No"
      expect(inferredAnswers["5.1"]).toBe("No");
      
      // 7.3 should not be inferred when 7.1 is "Yes"
      expect(inferredAnswers["7.3"]).toBeUndefined();
      
      // The original answers should still be there
      expect(inferredAnswers["2.6"]).toBe("Yes");
      expect(inferredAnswers["2.7"]).toBe("No");
      expect(inferredAnswers["7.1"]).toBe("Yes");
      
      // We should have the original 3 answers plus 1 inferred answer
      expect(Object.keys(inferredAnswers).length).toBe(4);
    });

    it('should handle multi-select questions correctly', () => {
      // Create a question with multiSelect and an infer method that returns an array
      const multiSelectQuestion = questions.find(q => q.id === "4.1");
      expect(multiSelectQuestion?.multiSelect).toBe(true);
      
      // Test with a mock infer method that returns an array
      const mockQuestions = [
        {
          id: "test.1",
          text: "Test multi-select question",
          section: 1,
          multiSelect: true,
          infer: () => ["Option 1", "Option 2"]
        }
      ];
      
      const inferredAnswers = applyInferenceRules(mockQuestions as any, {});
      expect(inferredAnswers["test.1"]).toEqual(["Option 1", "Option 2"]);
    });
  });
});
