import { createLogger } from '@/lib/logger';
import { ComplexityAnalysis } from './question-complexity';
import { aiResponseConfig } from '@/config/ai-response';

const logger = createLogger('analytics');

/**
 * Logs question complexity analytics data
 * 
 * @param question The user's question
 * @param complexity The complexity analysis result
 * @param actualResponseTime The actual time it took to get a response (in milliseconds)
 * @param userId Optional user ID for tracking
 */
export function logQuestionComplexity(
  question: string, 
  complexity: ComplexityAnalysis, 
  actualResponseTime: number,
  userId?: string
) {
  if (!aiResponseConfig.logComplexityAnalysis) {
    return;
  }

  const analyticsData = {
    question,
    complexityScore: complexity.score,
    complexityLevel: complexity.level,
    factors: complexity.factors,
    appliedDelay: complexity.recommendedDelay,
    actualResponseTime,
    timestamp: new Date().toISOString(),
    userId: userId || 'anonymous',
  };

  // Log to console in development
  logger.info('Question Complexity Analytics:', analyticsData);

  // In a production environment, you might want to send this data to an analytics service
  // This could be implemented as an API call to your analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    try {
      // This is a placeholder for where you would send the data to your analytics service
      // Example: await fetch('/api/analytics/question-complexity', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analyticsData),
      // });
    } catch (error) {
      logger.error('Failed to send analytics data', error);
    }
  }
}

/**
 * Determines whether to apply a delay for a specific user (for A/B testing)
 * 
 * @param userId The user's ID
 * @returns Boolean indicating whether to apply delay for this user
 */
export function shouldApplyDelay(userId: string): boolean {
  if (!aiResponseConfig.enableABTesting) {
    return aiResponseConfig.enableComplexityDelay;
  }

  // Simple deterministic A/B test based on user ID
  // In a real implementation, you'd use a proper A/B testing framework
  if (!userId) {
    return aiResponseConfig.enableComplexityDelay;
  }

  // Generate a hash value from the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // Use the hash to determine if this user gets delays
  // The absolute value of the hash modulo 100 gives a number between 0-99
  const userBucket = Math.abs(hash) % 100;
  
  // If the user's bucket is less than the percentage threshold, apply delays
  return userBucket < aiResponseConfig.abTestingDelayPercentage;
}
