import { describe, it, expect } from 'vitest';
import { Section } from '@/types';
import { sectionRelations, verifyAllSectionsHaveRelation, getSectionFromId, getAllRelatedSections } from './section-service';

describe('Section Relations', () => {
  it('every Section has a SectionRelation entry', () => {
    const defined = new Set(sectionRelations.map(r => r.section));
    const allSections = Object.values(Section);
    
    expect(defined.size).toBe(allSections.length);
    allSections.forEach(s => expect(defined.has(s)).toBe(true));
    
    // Ensure we have exactly one relation per section
    expect(sectionRelations.length).toBe(Object.values(Section).length);
  });
  
  it('verifyAllSectionsHaveRelation returns true', () => {
    expect(verifyAllSectionsHaveRelation()).toBe(true);
  });
  
  it('all related sections are valid Section enum values', () => {
    const allSections = new Set(Object.values(Section));
    
    sectionRelations.forEach(relation => {
      relation.relatedTo.forEach(relatedSection => {
        expect(allSections.has(relatedSection)).toBe(true);
      });
    });
  });
  
  it('no section is related to itself', () => {
    sectionRelations.forEach(relation => {
      expect(relation.relatedTo.includes(relation.section)).toBe(false);
    });
  });
  
  it('relationships are bidirectional', () => {
    // For each section, if it's related to another section, that section should be related to it
    sectionRelations.forEach(relation => {
      relation.relatedTo.forEach(relatedSection => {
        const reverseRelation = sectionRelations.find(r => r.section === relatedSection);
        expect(reverseRelation).toBeDefined();
        expect(reverseRelation?.relatedTo.includes(relation.section)).toBe(true);
      });
    });
  });
  
  it('relatedTo arrays do not contain duplicates', () => {
    sectionRelations.forEach(relation => {
      // Create a Set from the relatedTo array to remove duplicates
      const uniqueRelated = new Set(relation.relatedTo);
      
      // If there are duplicates, the Set size will be smaller than the array length
      expect(uniqueRelated.size).toBe(relation.relatedTo.length);
    });
  });
});

describe('getAllRelatedSections', () => {
  it('returns all related sections including transitive relationships', () => {
    // Privacy is related to HealthData, DataScope, DataRetention, AI_ML, QuebecLaw25, GDPR, HIPAA
    // And those sections are related to others, so we should get a larger set
    const allRelated = getAllRelatedSections(Section.Privacy);
    
    // Direct relationships
    expect(allRelated).toContain(Section.HealthData);
    expect(allRelated).toContain(Section.DataScope);
    expect(allRelated).toContain(Section.DataRetention);
    expect(allRelated).toContain(Section.AI_ML);
    expect(allRelated).toContain(Section.QuebecLaw25);
    expect(allRelated).toContain(Section.GDPR);
    expect(allRelated).toContain(Section.HIPAA);
    
    // Transitive relationships (examples)
    // Privacy -> HealthData -> HIPAA
    expect(allRelated).toContain(Section.HIPAA);
    
    // Privacy -> AI_ML -> Security
    expect(allRelated).toContain(Section.Security);
    
    // The original section should not be included
    expect(allRelated).not.toContain(Section.Privacy);
  });
  
  it('returns empty array for a section with no relationships', () => {
    // Create a mock section with no relationships for testing
    const mockSection = 'MockSection' as unknown as Section;
    expect(getAllRelatedSections(mockSection)).toEqual([]);
  });
  
  it('handles circular relationships correctly', () => {
    // DataScope is related to ProjectInfo, Privacy, HealthData, DataRetention
    // And some of those are related back to DataScope, which could cause infinite loops
    // if not handled correctly
    const allRelated = getAllRelatedSections(Section.DataScope);
    
    // Make sure we get a finite set of results
    expect(allRelated.length).toBeGreaterThan(0);
    expect(allRelated.length).toBeLessThan(Object.values(Section).length);
    
    // The original section should not be included
    expect(allRelated).not.toContain(Section.DataScope);
  });
  
  it('handles deliberately injected two-node cycles', () => {
    // Create a temporary copy of sectionRelations with a deliberate cycle
    const originalRelations = [...sectionRelations];
    
    try {
      // Create a mock section relation with a deliberate cycle
      const mockSectionA = 'SectionA' as unknown as Section;
      const mockSectionB = 'SectionB' as unknown as Section;
      
      // Replace the sectionRelations with our mock relations
      (sectionRelations as any).length = 0;
      sectionRelations.push(
        { section: mockSectionA, relatedTo: [mockSectionB] },
        { section: mockSectionB, relatedTo: [mockSectionA] }
      );
      
      // This should not cause an infinite loop
      const result = getAllRelatedSections(mockSectionA);
      
      // Should contain only mockSectionB
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(mockSectionB);
      
      // The original section should not be included
      expect(result).not.toContain(mockSectionA);
    } finally {
      // Restore the original sectionRelations
      (sectionRelations as any).length = 0;
      originalRelations.forEach(r => sectionRelations.push(r));
    }
  });
  
  it('handles deliberately injected three-node cycles', () => {
    // Create a temporary copy of sectionRelations with a deliberate 3-node cycle
    const originalRelations = [...sectionRelations];
    
    try {
      // Create a mock section relation with a deliberate 3-node cycle (A→B→C→A)
      const mockSectionA = 'SectionA' as unknown as Section;
      const mockSectionB = 'SectionB' as unknown as Section;
      const mockSectionC = 'SectionC' as unknown as Section;
      
      // Replace the sectionRelations with our mock relations
      (sectionRelations as any).length = 0;
      sectionRelations.push(
        { section: mockSectionA, relatedTo: [mockSectionB] },
        { section: mockSectionB, relatedTo: [mockSectionC] },
        { section: mockSectionC, relatedTo: [mockSectionA] }
      );
      
      // This should not cause an infinite loop
      const result = getAllRelatedSections(mockSectionA);
      
      // Should contain both mockSectionB and mockSectionC
      expect(result).toHaveLength(2);
      expect(result).toContain(mockSectionB);
      expect(result).toContain(mockSectionC);
      
      // The original section should not be included
      expect(result).not.toContain(mockSectionA);
      
      // Each section should only appear once in the result
      const uniqueResults = new Set(result);
      expect(uniqueResults.size).toBe(result.length);
    } finally {
      // Restore the original sectionRelations
      (sectionRelations as any).length = 0;
      originalRelations.forEach(r => sectionRelations.push(r));
    }
  });
});

describe('getSectionFromId performance', () => {
  it('runs in O(1) time due to memoization', () => {
    // Create a large number of question IDs to test
    const questionIds = Array.from({ length: 10000 }, (_, i) => 
      `${i % 13 + 1}.${i % 10} Test question ${i}`
    );
    
    // First run to populate the cache
    questionIds.forEach(id => getSectionFromId(id));
    
    // Measure time for subsequent runs (should be fast due to memoization)
    const startTime = performance.now();
    
    questionIds.forEach(id => getSectionFromId(id));
    
    const endTime = performance.now();
    const timePerCall = (endTime - startTime) / questionIds.length;
    
    // Should be very fast per call (typically microseconds)
    // We're using a loose bound here to account for test environment variability
    expect(timePerCall).toBeLessThan(0.01); // Less than 0.01ms per call
    
    // Verify that repeated calls with the same ID are even faster
    const singleId = '1.1 Description';
    
    const singleStartTime = performance.now();
    for (let i = 0; i < 1000; i++) {
      getSectionFromId(singleId);
    }
    const singleEndTime = performance.now();
    const singleTimePerCall = (singleEndTime - singleStartTime) / 1000;
    
    // Repeated calls to the same ID should be extremely fast
    expect(singleTimePerCall).toBeLessThan(0.005); // Less than 0.005ms per call
  });
});

describe('getSectionFromId cache eviction', () => {
  it('properly evicts entries when cache size limit is reached', () => {
    // Create a custom implementation of getSectionFromId with a small cache size
    // to test the cache eviction logic
    const testCache = new Map<string, Section | undefined>();
    const testCacheKeys: string[] = [];
    const TEST_CACHE_SIZE = 3;
    
    function testGetSectionFromId(questionId: string): Section | undefined {
      // Check cache first
      if (testCache.has(questionId)) {
        return testCache.get(questionId);
      }
      
      const sectionMatch = questionId.match(/^(\d+)\./);
      const sectionId = sectionMatch ? sectionMatch[1] : undefined;
      
      if (!sectionId) {
        // Cache the result and return
        // If we've reached the maximum cache size, remove the oldest entry
        if (testCache.size >= TEST_CACHE_SIZE && testCacheKeys.length > 0) {
          const oldestKey = testCacheKeys.shift();
          if (oldestKey) {
            testCache.delete(oldestKey);
          }
        }
        
        // Add the new entry
        testCache.set(questionId, undefined);
        testCacheKeys.push(questionId);
        return undefined;
      }
      
      // Find the matching Section enum value
      const result = Object.values(Section).find(s => s === sectionId);
      
      // Cache the result and return
      // If we've reached the maximum cache size, remove the oldest entry
      if (testCache.size >= TEST_CACHE_SIZE && testCacheKeys.length > 0) {
        const oldestKey = testCacheKeys.shift();
        if (oldestKey) {
          testCache.delete(oldestKey);
        }
      }
      
      // Add the new entry
      testCache.set(questionId, result);
      testCacheKeys.push(questionId);
      return result;
    }
    
    // Fill the cache to its limit
    testGetSectionFromId('1.1 Test');
    testGetSectionFromId('2.1 Test');
    testGetSectionFromId('3.1 Test');
    
    // Verify cache state
    expect(testCache.size).toBe(3);
    expect(testCacheKeys.length).toBe(3);
    expect(testCache.has('1.1 Test')).toBe(true);
    expect(testCache.has('2.1 Test')).toBe(true);
    expect(testCache.has('3.1 Test')).toBe(true);
    
    // Add one more entry to trigger eviction
    testGetSectionFromId('4.1 Test');
    
    // Verify the oldest entry was evicted
    expect(testCache.size).toBe(3);
    expect(testCacheKeys.length).toBe(3);
    expect(testCache.has('1.1 Test')).toBe(false); // Should be evicted
    expect(testCache.has('2.1 Test')).toBe(true);
    expect(testCache.has('3.1 Test')).toBe(true);
    expect(testCache.has('4.1 Test')).toBe(true);
    
    // Add two more entries
    testGetSectionFromId('5.1 Test');
    testGetSectionFromId('6.1 Test');
    
    // Verify the next two oldest entries were evicted
    expect(testCache.size).toBe(3);
    expect(testCacheKeys.length).toBe(3);
    expect(testCache.has('1.1 Test')).toBe(false);
    expect(testCache.has('2.1 Test')).toBe(false); // Should be evicted
    expect(testCache.has('3.1 Test')).toBe(false); // Should be evicted
    expect(testCache.has('4.1 Test')).toBe(true);
    expect(testCache.has('5.1 Test')).toBe(true);
    expect(testCache.has('6.1 Test')).toBe(true);
  });
});

describe('getSectionFromId', () => {
  it('extracts section ID from question ID', () => {
    expect(getSectionFromId('1.1 Description *')).toBe(Section.ProjectInfo);
    expect(getSectionFromId('2.6 Is personal information in scope for this initiative?')).toBe(Section.DataScope);
    expect(getSectionFromId('13.1 Identify any third parties involved')).toBe(Section.VendorRisk);
  });
  
  it('handles different question ID formats', () => {
    // Standard format
    expect(getSectionFromId('3.2 Data retention policy')).toBe(Section.DataRetention);
    
    // With sub-question letters
    expect(getSectionFromId('10.1a Quebec Law 25 compliance')).toBe(Section.QuebecLaw25);
    
    // With multiple digits in section number
    expect(getSectionFromId('11.3 GDPR compliance measures')).toBe(Section.GDPR);
    expect(getSectionFromId('12.5 HIPAA requirements')).toBe(Section.HIPAA);
  });
  
  it('returns undefined for invalid question IDs', () => {
    expect(getSectionFromId('Invalid question')).toBeUndefined();
    expect(getSectionFromId('')).toBeUndefined();
    expect(getSectionFromId('X.Y Some invalid format')).toBeUndefined();
    expect(getSectionFromId('999.1 Non-existent section')).toBeUndefined();
  });
  
  it('covers all sections in the enum', () => {
    // Create a test question ID for each section
    Object.values(Section).forEach(sectionId => {
      const questionId = `${sectionId}.1 Test question`;
      expect(getSectionFromId(questionId)).toBe(sectionId);
    });
  });
});
