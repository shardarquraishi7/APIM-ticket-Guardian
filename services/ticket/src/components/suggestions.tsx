import { ChatRequestOptions, CreateMessage, Message } from 'ai';

interface SuggestionsProps {
  messages: Message[];
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

export const suggestions = [
  {
    title: 'What are the steps to',
    description: 'onboard an API onto the API Marketplace?',
    message: {
      role: 'user',
      content: 'What are the steps to onboard an API onto the API Marketplace?',
    },
  },
  {
    title: 'How do I acquire an API',
    description: 'from the API Marketplace?',
    message: {
      role: 'user',
      content: 'How do I acquire an API from the API Marketplace?',
    },
  },
  {
    title: 'Where do I go to',
    description: 'get access to GitHub?',
    message: {
      role: 'user',
      content: 'Where do I go to get access to GitHub?',
    },
  },
  {
    title: 'How do I',
    description: 'reset my SAP password?',
    message: {
      role: 'user',
      content: 'How do I reset my SAP password?',
    },
  },
];

export function Suggestions({ messages, append }: SuggestionsProps) {
  if (messages.length > 0) {
    return;
  }

  return (
    <div
      data-testid="suggestions-container"
      className="flex flex-col gap-2 w-full md:max-w-3xl mx-auto px-6"
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Suggestions</h3>
      <ul className="grid grid-cols-2 gap-4 mx-auto bg-background pb-4 md:pb-6 w-full md:max-w-3xl">
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion.title}
            {...suggestion}
            append={() => append(suggestion.message as Message)}
          />
        ))}
      </ul>
    </div>
  );
}

export function Suggestion({
  title,
  description,
  append,
}: {
  title: string;
  description: string;
  append?: () => Promise<string | null | undefined>;
}) {
  return (
    <li>
      <button
        className="w-full text-left cursor-pointer border border-gray-100 dark:border-gray-800 hover:border-purple-700 dark:hover:border-purple-500 flex flex-col gap-2 rounded-lg p-4 focus:ring-2 focus-visible:outline-none  focus:ring-purple-700 dark:focus:ring-purple-500"
        onClick={() => append?.()}
      >
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </button>
    </li>
  );
}
