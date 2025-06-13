'use client';

import { Message } from 'ai';
import { memo } from 'react';
import { FileDownload } from './file-download';

interface TicketFileMessageProps {
  message: Message;
}

function PureTicketFileMessage({ message }: TicketFileMessageProps) {
  // Extract file information from the message data
  const data = message.data as any;
  const filePath = data?.filePath;
  const fileName = data?.fileName;
  const uploadStatus = data?.uploadStatus;
  const stats = data?.stats;
  
  if (!filePath || !fileName) {
    return null;
  }
  
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold">API Ticket File</h3>
      
      {uploadStatus === 'success' && (
        <div className="text-green-600 dark:text-green-400 mb-2">
          ✅ Successfully processed API ticket file
        </div>
      )}
      
      {stats && (
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          <p>Processed {stats.processedTickets || 0} tickets in the API file.</p>
        </div>
      )}
      
      <FileDownload filePath={filePath} fileName={fileName} />
    </div>
  );
}

export const TicketFileMessage = memo(PureTicketFileMessage);
