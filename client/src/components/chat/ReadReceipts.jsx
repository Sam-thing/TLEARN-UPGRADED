// src/components/chat/ReadReceipts.jsx - Read Receipts Display
import { Check, CheckCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const ReadReceipts = ({ message, currentUserId }) => {
  if (!message.readBy || message.readBy.length === 0) {
    // Sent but not delivered yet
    return (
      <Check className="w-3 h-3 text-gray-400" />
    );
  }

  // Filter out the sender from readBy
  const readers = message.readBy.filter(read => read.user !== currentUserId);

  if (readers.length === 0) {
    // Delivered but not read
    return (
      <CheckCheck className="w-3 h-3 text-gray-400" />
    );
  }

  // Read by others
  const readerNames = readers
    .map(read => read.userName || 'Someone')
    .join(', ');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CheckCheck className="w-3 h-3 text-blue-500" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Read by {readerNames}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ReadReceipts;