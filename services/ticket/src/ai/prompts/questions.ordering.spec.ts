import { describe, it, expect } from 'vitest';
import { questions, anchorQuestions } from './questions';

describe('Anchor Questions Ordering', () => {
  it('should sort anchor questions by priority in ascending order', () => {
    // Get the priorities of the anchor questions
    const priorities = anchorQuestions.map(q => q.priority!);
    
    // Verify that the priorities are in ascending order
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i]).toBeGreaterThanOrEqual(priorities[i-1]);
    }
  });
  
  it('should have anchor questions in the correct business priority order', () => {
    // Get the IDs of the anchor questions
    const anchorIds = anchorQuestions.map(q => q.id);
    
    // Verify that the first few anchor questions are in the expected order
    // This is a business rule validation, so we're checking the specific IDs
    expect(anchorIds[0]).toBe('2.6'); // Personal information in scope
    
    // Find the indices of key questions to verify their relative order
    const personalInfoIndex = anchorIds.indexOf('2.6');
    const thirdPartyIndex = anchorIds.indexOf('13.1');
    const aiIndex = anchorIds.indexOf('7.1');
    const pciIndex = anchorIds.indexOf('9.1');
    
    // Verify that the key questions are in the expected order
    // Personal info should come before third party, AI, and PCI
    expect(personalInfoIndex).toBeLessThan(thirdPartyIndex);
    expect(personalInfoIndex).toBeLessThan(aiIndex);
    expect(personalInfoIndex).toBeLessThan(pciIndex);
  });
  
  it('should have all anchor questions with defined priorities', () => {
    // Verify that all anchor questions have a priority defined
    for (const anchor of anchorQuestions) {
      expect(anchor.priority).toBeDefined();
    }
  });
  
  it('should have unique priorities for anchor questions', () => {
    // Get the priorities of the anchor questions
    const priorities = anchorQuestions.map(q => q.priority!);
    
    // Verify that each priority is unique
    const uniquePriorities = new Set(priorities);
    expect(uniquePriorities.size).toBe(priorities.length);
  });
});
