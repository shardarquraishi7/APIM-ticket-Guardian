import useSWR from 'swr';
import { Feedback } from '@/db/schema';

const fetcher = ([url, id]: [string, string]) => fetch(`${url}/${id}`).then((res) => res.json());

export function useFeedback(messageId: string) {
  const { data, isLoading, mutate } = useSWR<Feedback | undefined>(
    ['/api/feedback', messageId],
    fetcher,
    {
      fallbackData: undefined,
    },
  );

  return {
    feedback: data,
    isLoading,
    mutate,
  };
}
