import { describe, expect, it } from 'vitest';
import { type FeedbackSchema, feedbackSchema } from './feedback';

describe('feedbackSchema', () => {
  it('should validate a valid feedback object', () => {
    const validFeedback: FeedbackSchema = {
      messageId: '123456',
      isPositive: true,
      comments: 'Great service!',
    };

    const result = feedbackSchema.safeParse(validFeedback);
    expect(result.success).toBe(true);
  });

  it('should validate when comments is null', () => {
    const feedbackWithNullComments: FeedbackSchema = {
      messageId: '123456',
      isPositive: false,
      comments: null,
    };

    const result = feedbackSchema.safeParse(feedbackWithNullComments);
    expect(result.success).toBe(true);
  });

  it('should reject when messageId is empty', () => {
    const invalidFeedback = {
      messageId: '',
      isPositive: true,
      comments: 'Test comment',
    };

    const result = feedbackSchema.safeParse(invalidFeedback);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('messageId');
    }
  });

  it('should reject when messageId is missing', () => {
    const invalidFeedback = {
      isPositive: true,
      comments: 'Test comment',
    };

    const result = feedbackSchema.safeParse(invalidFeedback);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('messageId');
    }
  });

  it('should reject when isPositive is not a boolean', () => {
    const invalidFeedback = {
      messageId: '123456',
      isPositive: 'yes', // should be boolean
      comments: 'Test comment',
    };

    const result = feedbackSchema.safeParse(invalidFeedback);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('isPositive');
    }
  });

  it('should reject when comments is not a string or null', () => {
    const invalidFeedback = {
      messageId: '123456',
      isPositive: true,
      comments: 123, // should be string or null
    };

    const result = feedbackSchema.safeParse(invalidFeedback);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('comments');
    }
  });
});
