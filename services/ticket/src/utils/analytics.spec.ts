import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logQuestionComplexity, shouldApplyDelay } from './analytics';
import { ComplexityLevel } from './question-complexity';
import * as aiResponseConfig from '@/config/ai-response';

describe('logQuestionComplexity', () => {
  const mockLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.mock('@/lib/logger', () => ({
      createLogger: () => mockLogger,
    }));

    // Mock the aiResponseConfig
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      enableComplexityDelay: true,
      delayMultiplier: 1.0,
      maxDelay: 3000,
      minComplexDelay: 800,
      logComplexityAnalysis: true,
      enableABTesting: false,
      abTestingDelayPercentage: 50,
    });

    // Mock process.env
    vi.stubGlobal('process', {
      env: {
        NODE_ENV: 'development',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log analytics data when logging is enabled', () => {
    const complexity = {
      level: ComplexityLevel.MODERATE,
      score: 45,
      factors: ['Test factor'],
      recommendedDelay: 1200,
    };

    logQuestionComplexity('Test question', complexity, 1500, 'test-user-id');

    expect(mockLogger.info).toHaveBeenCalledWith('Question Complexity Analytics:', expect.objectContaining({
      question: 'Test question',
      complexityScore: 45,
      complexityLevel: ComplexityLevel.MODERATE,
      factors: ['Test factor'],
      appliedDelay: 1200,
      actualResponseTime: 1500,
      userId: 'test-user-id',
    }));
  });

  it('should not log analytics data when logging is disabled', () => {
    // Disable logging
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      logComplexityAnalysis: false,
    });

    const complexity = {
      level: ComplexityLevel.MODERATE,
      score: 45,
      factors: ['Test factor'],
      recommendedDelay: 1200,
    };

    logQuestionComplexity('Test question', complexity, 1500, 'test-user-id');

    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it('should use "anonymous" as userId when not provided', () => {
    const complexity = {
      level: ComplexityLevel.MODERATE,
      score: 45,
      factors: ['Test factor'],
      recommendedDelay: 1200,
    };

    logQuestionComplexity('Test question', complexity, 1500);

    expect(mockLogger.info).toHaveBeenCalledWith('Question Complexity Analytics:', expect.objectContaining({
      userId: 'anonymous',
    }));
  });
});

describe('shouldApplyDelay', () => {
  beforeEach(() => {
    // Mock the aiResponseConfig
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      enableComplexityDelay: true,
      delayMultiplier: 1.0,
      maxDelay: 3000,
      minComplexDelay: 800,
      logComplexityAnalysis: true,
      enableABTesting: false,
      abTestingDelayPercentage: 50,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return enableComplexityDelay value when A/B testing is disabled', () => {
    // When enableComplexityDelay is true
    expect(shouldApplyDelay('test-user-id')).toBe(true);

    // When enableComplexityDelay is false
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      enableComplexityDelay: false,
    });
    expect(shouldApplyDelay('test-user-id')).toBe(false);
  });

  it('should use A/B testing logic when enabled', () => {
    // Enable A/B testing
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      enableABTesting: true,
      abTestingDelayPercentage: 50,
    });

    // Test with multiple user IDs to ensure some get delays and some don't
    const results = Array.from({ length: 20 }, (_, i) => shouldApplyDelay(`user-${i}`));
    
    // With a 50% threshold, we expect some true and some false values
    const trueCount = results.filter(result => result).length;
    expect(trueCount).toBeGreaterThan(0);
    expect(trueCount).toBeLessThan(20);
  });

  it('should return enableComplexityDelay when userId is not provided and A/B testing is enabled', () => {
    // Enable A/B testing
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      enableABTesting: true,
      enableComplexityDelay: true,
    });

    // @ts-ignore - Testing with undefined userId
    expect(shouldApplyDelay()).toBe(true);

    // When enableComplexityDelay is false
    vi.spyOn(aiResponseConfig, 'aiResponseConfig', 'get').mockReturnValue({
      ...aiResponseConfig.aiResponseConfig,
      enableABTesting: true,
      enableComplexityDelay: false,
    });
    // @ts-ignore - Testing with undefined userId
    expect(shouldApplyDelay()).toBe(false);
  });
});
