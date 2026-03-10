// src/components/chat/MessageActions.jsx - Edit/Delete Actions
import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const MessageActions = ({ message, isOwn, onEdit, onDelete, onCopy }) => {
  if (!isOwn && message.type !== 'text') return null; // Only show for own messages or text that can be copied

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {message.type === 'text' && (
          <DropdownMenuItem onClick={() => onCopy(message.content || message.message)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy text
          </DropdownMenuItem>
        )}
        
        {isOwn && message.type === 'text' && (
          <>
            <DropdownMenuItem onClick={() => onEdit(message)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(message._id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;