import { useState } from 'react';
import { Button } from '@/components/button';

interface KnowledgeBaseStatusProps {
  className?: string;
}

export function KnowledgeBaseStatus({ className }: KnowledgeBaseStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const syncKnowledgeBase = async () => {
    try {
      setIsLoading(true);
      setStatus('idle');
      setMessage(null);

      const response = await fetch('/api/sync-knowledge-base', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync knowledge base');
      }

      const data = await response.json();
      setStatus('success');
      setMessage(`Knowledge base synced successfully. Processed ${data.chunksProcessed || 0} chunks.`);
    } catch (error) {
      console.error('Error syncing knowledge base:', error);
      setStatus('error');
      setMessage('Failed to sync knowledge base. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <h3 className="text-lg font-medium mb-2">Knowledge Base Status</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={syncKnowledgeBase}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Syncing...' : 'Sync Knowledge Base'}
          </Button>
        </div>
        
        {message && (
          <div
            className={`p-3 rounded text-sm ${
              status === 'success'
                ? 'bg-green-100 text-green-800'
                : status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message}
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <p>
            The knowledge base contains DEP documentation that helps the AI assistant
            provide accurate information about the DEP process, roles, and risk assessment.
          </p>
          <p className="mt-2">
            Syncing the knowledge base will process all markdown files in the knowledge base
            directory and update the vector database for semantic search.
          </p>
        </div>
      </div>
    </div>
  );
}
