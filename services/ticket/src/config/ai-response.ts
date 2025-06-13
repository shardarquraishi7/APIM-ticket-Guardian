/**
 * Configuration settings for AI response behavior
 */

export const aiResponseConfig = {
  /**
   * Enable/disable the complexity-based delay feature
   */
  enableComplexityDelay: true,
  
  /**
   * Delay multiplier (adjust to increase/decrease all delays)
   * 1.0 = normal delays, 0.5 = half delays, 2.0 = double delays
   */
  delayMultiplier: 1.0,
  
  /**
   * Maximum delay in milliseconds (caps all delays at this value)
   */
  maxDelay: 3000,
  
  /**
   * Minimum delay in milliseconds for complex questions
   * (ensures even "simple" questions that are classified as complex get some delay)
   */
  minComplexDelay: 800,
  
  /**
   * Enable/disable logging of complexity analysis
   */
  logComplexityAnalysis: true,
  
  /**
   * Enable/disable A/B testing for delays
   */
  enableABTesting: false,
  
  /**
   * Percentage of users who should get delays (0-100)
   * Only used if enableABTesting is true
   */
  abTestingDelayPercentage: 50,
};
