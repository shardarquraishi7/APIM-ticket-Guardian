'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Feedback } from '@/db/schema';
import { useFeedback } from '@/hooks/use-feedback';
import { UIMessageWithFeedback } from '@/utils/convert-to-ui-messages';
import { FeedbackSchema } from '@/validations/feedback';
import { Button } from './button';
import { CopyIcon } from './icons/copy';
import { ThumbsDownIcon } from './icons/thumbs-down';
import { ThumbsDownFillIcon } from './icons/thumbs-down-fill';
import { ThumbsUpIcon } from './icons/thumbs-up';
import { ThumbsUpFillIcon } from './icons/thumbs-up-fill';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';

interface InlineFeedbackProps {
  message: UIMessageWithFeedback;
}

export function InlineFeedback({ message }: InlineFeedbackProps) {
  const { feedback, mutate } = useFeedback(message.id);
  const [showNegativeFeedback, setShowNegativeFeedback] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(message.content);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handlePositiveFeedback = async () => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          isPositive: true,
          comments: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      mutate(await response.json());
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const handleNegativeFeedback = async (data: FeedbackSchema | null = null) => {
    try {
      if (showNegativeFeedback) {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            data ?? {
              messageId: message.id,
              isPositive: false,
              comments: null,
            },
          ),
        });

        if (!response.ok) {
          throw new Error('Failed to submit feedback');
        }

        mutate(await response.json());
        setShowNegativeFeedback(false);
        toast.success('Thank you for your feedback!');
      } else {
        setShowNegativeFeedback(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <ul className="w-full flex items-center gap-3">
      <li>
        <button
          data-testid="copy-button"
          type="button"
          className="cursor-pointer flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-purple-500"
          onClick={handleCopy}
        >
          <CopyIcon className="size-4 " />
        </button>
      </li>
      <li>
        <button
          data-testid="positive-feedback-button"
          type="button"
          className="cursor-pointer flex items-center justify-center"
          onClick={handlePositiveFeedback}
        >
          {feedback && feedback.isPositive ? (
            <ThumbsUpFillIcon className="size-4 text-purple-900 dark:text-purple-500" />
          ) : (
            <ThumbsUpIcon className="size-4 text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-purple-500" />
          )}
        </button>
      </li>
      <li>
        <button
          data-testid="negative-feedback-button"
          type="button"
          className="cursor-pointer flex items-center justify-center"
          onClick={() => handleNegativeFeedback()}
        >
          {feedback && !feedback.isPositive ? (
            <ThumbsDownFillIcon className="size-4 text-purple-900 dark:text-purple-500" />
          ) : (
            <ThumbsDownIcon className="size-4 text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-purple-500" />
          )}
        </button>
        <Dialog open={showNegativeFeedback} onOpenChange={setShowNegativeFeedback}>
          <DialogContent>
            <DialogTitle>Comments</DialogTitle>
            <NegativeFeedbackForm
              message={message}
              feedback={feedback}
              close={() => setShowNegativeFeedback(false)}
              onSubmit={handleNegativeFeedback}
            />
          </DialogContent>
        </Dialog>
      </li>
    </ul>
  );
}

type NegativeFeedbackProps = InlineFeedbackProps & {
  feedback?: Feedback;
  close: () => void;
  onSubmit: () => Promise<any>;
};

export function NegativeFeedbackForm({
  message,
  feedback,
  close,
  onSubmit,
}: NegativeFeedbackProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FeedbackSchema>({
    defaultValues: {
      messageId: message.id,
      isPositive: false,
      comments: feedback ? feedback.comments : '',
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-w-64 flex flex-col gap-4">
      <div>
        <textarea
          placeholder="Please tell us what went wrong"
          {...register('comments')}
          disabled={isSubmitting}
          rows={3}
          className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg p-2 dark:bg-gray-900"
        />
        <div className="flex items-center justify-between gap-2 mt-2">
          <Button
            data-testid="cancel-button"
            size="sm"
            variant="default"
            appearance="outline"
            onClick={close}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            data-testid="submit-button"
            type="submit"
            size="sm"
            variant="purple"
            disabled={isSubmitting}
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}
