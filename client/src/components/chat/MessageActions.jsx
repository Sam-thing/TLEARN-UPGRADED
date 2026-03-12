// src/components/chat/MessageActions.jsx - Message Actions Dropdown (FIXED)
import { MoreVertical, Edit, Trash2, Copy, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MessageActions = ({ message, isOwn, onEdit, onDelete, onCopy, onPin }) => {
  // DEBUG: Log to see what's happening
  console.log('🔧 MessageActions:', {
    messageId: message._id?.substring(0, 8),
    isOwn,
    isPinned: message.isPinned
  });

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
      
      <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
        {/* Copy - available for all text messages */}
        {message.type === 'text' && (
          <DropdownMenuItem onClick={() => onCopy(message.content || message.message)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy text
          </DropdownMenuItem>
        )}

        {/* Pin - available for all messages */}
        {onPin && (
          <DropdownMenuItem onClick={() => onPin(message._id)}>
            {message.isPinned ? (
              <>
                <PinOff className="w-4 h-4 mr-2" />
                Unpin message
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 mr-2" />
                Pin message
              </>
            )}
          </DropdownMenuItem>
        )}
        
        {/* Edit & Delete - only for own text messages */}
        {isOwn && message.type === 'text' && (
          <>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => onEdit(message)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit message
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onDelete(message._id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete message
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;