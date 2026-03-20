// src/pages/rooms/RoomChatPage.jsx - FIXED VERSION
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Users,
  Info,
  LogOut,
  Mic,
  Paperclip,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/axios';
import ReadReceipts from '@/components/chat/ReadReceipts';
import { getAvatarColor, getInitials } from '@/utils/avatarColors';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import AudioPlayer from '@/components/chat/AudioPlayer';
import MessageReactions from '@/components/chat/MessageReactions';
import MessageActions from '@/components/chat/MessageActions';
import PinnedMessages from '@/components/chat/PinnedMessages';
import FileUploader from '@/components/chat/FileUploader';
import FilePreview from '@/components/chat/FilePreview';
import MessageSearch from '@/components/chat/MessageSearch';

const RoomChatPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);

  // Load room and messages on mount
  useEffect(() => {
    if (user) {
      loadRoom();
      loadMessages();
    }
  }, [roomId, user]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !roomId) return;

    console.log('🔌 Setting up socket listeners for room:', roomId);

    // Join room
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('receive-message', (message) => {
      console.log('📩 Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Listen for user joined/left
    socket.on('user-joined', (data) => {
      const systemMessage = {
        _id: Date.now().toString(),
        type: 'system',
        content: `${data.userName} joined the room`,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('user-left', (data) => {
      const systemMessage = {
        _id: Date.now().toString(),
        type: 'system',
        content: `${data.userName || 'Someone'} left the room`,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    // Online users count
    socket.on('room-users-update', (data) => {
      setOnlineCount(data.count);
    });

    // Typing indicators
    socket.on('user-typing', (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('user-stopped-typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Listen for reactions
    socket.on('message-reacted', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    // Listen for edits
    socket.on('message-edited', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, content: data.content, message: data.content, isEdited: true, editedAt: data.editedAt }
          : msg
      ));
    });

    // Listen for deletes
    socket.on('message-deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Listen for pins
    socket.on('message-pinned', (data) => {
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, isPinned: data.isPinned, pinnedAt: data.pinnedAt }
          : msg
      ));
      window.dispatchEvent(new Event('reload-pinned'));
    });

    // Listen for read receipts
    socket.on('messages-read', (data) => {
      setMessages(prev => prev.map(msg => {
        if (data.messageIds.includes(msg._id)) {
          return {
            ...msg,
            readBy: [...(msg.readBy || []), {
              user: data.userId,
              userName: data.userName,
              readAt: new Date()
            }]
          };
        }
        return msg;
      }));
    });

    // Cleanup
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-users-update');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
      socket.off('message-reacted');
      socket.off('message-edited');
      socket.off('message-deleted');
      socket.off('message-pinned');
      socket.off('messages-read');
    };
  }, [socket, roomId, user]);

  // Mark messages as read
  useEffect(() => {
    if (!socket || !messages.length || !user) return;

    const unreadMessages = messages.filter(
      msg => msg.userId !== user.id && 
      msg.type !== 'system' &&
      (!msg.readBy || !msg.readBy.some(r => r.user === user.id))
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(m => m._id);
      
      api.post(`/messages/room/${roomId}/read`, { messageIds })
        .catch(err => console.error('Failed to mark as read:', err));
    }
  }, [messages, user, socket, roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRoom = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.room || response);
    } catch (error) {
      toast.error('Failed to load room');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/room/${roomId}`);
      
      const dbMessages = (response.messages || response || []).map(msg => ({
        _id: msg._id,
        userId: msg.sender?._id || msg.sender,
        userName: msg.senderName || msg.sender?.name,
        message: msg.content,
        content: msg.content,
        type: msg.type || 'text',
        timestamp: msg.createdAt,
        createdAt: msg.createdAt,
        audioUrl: msg.audioUrl,
        duration: msg.duration,
        waveformData: msg.waveformData || [],
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        fileSize: msg.fileSize,
        mimeType: msg.mimeType,
        reactions: msg.reactions || {},
        isEdited: msg.isEdited,
        editedAt: msg.editedAt
      }));
      
      setMessages(dbMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNavigateToMessage = (messageId) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30');
      setTimeout(() => {
        element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Send via socket (real-time)
    socket.emit('send-message', {
      roomId,
      message: messageContent
    });

    // Also save to database
    try {
      await api.post(`/messages/room/${roomId}`, { content: messageContent });
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    // Stop typing indicator
    socket.emit('typing-stop', roomId);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    socket.emit('typing-start', roomId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing-stop', roomId);
    }, 2000);
  };

  const handleSendVoiceMessage = async ({ audioBlob, duration, waveform }) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-message.webm');
      formData.append('duration', duration.toString());
      formData.append('waveformData', JSON.stringify(waveform));

      await api.post(`/audio/room/${roomId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowVoiceRecorder(false);
      toast.success('Voice message sent!');
    } catch (error) {
      console.error('Failed to send voice message:', error);
      toast.error('Failed to send voice message');
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      await api.post(`/messages/${messageId}/react`, { emoji });
    } catch (error) {
      console.error('Failed to react:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setEditText(message.content || message.message);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    if (!editText.trim() || !editingMessage) return;

    try {
      await api.patch(`/messages/${editingMessage._id}`, { content: editText.trim() });
      
      setEditingMessage(null);
      setEditText('');
      toast.success('Message edited');
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Delete this message?')) return;

    try {
      await api.delete(`/messages/${messageId}`);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleLeaveRoom = async () => {
    try {
      await api.post(`/rooms/${roomId}/leave`);
      toast.success('Left room');
      navigate('/rooms');
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  const handlePin = async (messageId) => {
    try {
      await api.post(`/messages/${messageId}/pin`);
    } catch (error) {
      console.error('Failed to pin message:', error);
      toast.error('Failed to pin message');
    }
  };

  const handleSendFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await api.post(`/files/room/${roomId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowFileUploader(false);
      toast.success('File sent!');
    } catch (error) {
      console.error('Failed to send file:', error);
      toast.error('Failed to send file');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-xl font-bold text-text-dark dark:text-foreground">
                {room?.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-text-medium">
                <Users className="w-4 h-4" />
                <span>{onlineCount} online</span>
                {typingUsers.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-forest italic">
                      {typingUsers.map(u => u.userName).join(', ')} typing...
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={connected ? 'default' : 'secondary'} className={connected ? 'bg-green-500' : ''}>
              {connected ? 'Connected' : 'Connecting...'}
            </Badge>
            
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="w-5 h-5" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={handleLeaveRoom}>
              <LogOut className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pinned Messages */}
      <PinnedMessages 
        roomId={roomId} 
        onNavigate={handleNavigateToMessage}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background p-4">
        <AnimatePresence>
          {showSearch && (
            <MessageSearch
              messages={messages}
              onNavigate={handleNavigateToMessage}
              onClose={() => setShowSearch(false)}
            />
          )}
        </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => {
              if (message.type === 'system') {
                return (
                  <MessageBubble
                    key={message._id || index}
                    message={message}
                    isOwn={false}
                    showAvatar={false}
                  />
                );
              }
              
              const messageUserId = message.userId || message.sender?._id || message.sender;
              const currentUserId = user?.id;
              const isOwn = messageUserId === currentUserId;
              
              return (
                <MessageBubble
                  key={message._id || index}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={
                    index === 0 ||
                    messages[index - 1].userId !== message.userId
                  }
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCopy={handleCopy}
                  onReact={handleReact}
                  onPin={handlePin}
                  currentUserId={user?.id}
                />
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white dark:bg-card p-4">
        {showFileUploader && (
          <FileUploader
            onUpload={handleSendFile}
            onCancel={() => setShowFileUploader(false)}
          />
        )}

        <form onSubmit={editingMessage ? handleSaveEdit : handleSendMessage} className="max-w-4xl mx-auto">
          {showVoiceRecorder ? (
            <VoiceRecorder
              onSend={handleSendVoiceMessage}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : editingMessage ? (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex-1">
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                  Editing message
                </div>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
              </div>
              <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editText.trim()} className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceRecorder(true)}
                disabled={!connected}
                className="flex-shrink-0"
              >
                <Mic className="w-5 h-5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowFileUploader(true)}
                disabled={!connected}
                className="flex-shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </Button>

              <Input
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1"
                disabled={!connected}
              />

              <Button
                type="submit"
                disabled={!newMessage.trim() || !connected}
                className="bg-forest hover:bg-forest/90 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Message Bubble Component (keeping the same as before)
const MessageBubble = ({ 
  message, 
  isOwn, 
  showAvatar,
  onEdit,      
  onDelete,    
  onCopy,      
  onReact, 
  onPin,    
  currentUserId 
}) => {
  const avatarColor = getAvatarColor(message.userId);
  const initials = getInitials(message.userName || message.senderName);

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-text-light bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.type === 'audio') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-forest text-white text-sm">
              {message.senderName?.[0] || message.userName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwn && (
            <span className="text-xs text-text-light mb-1">
              {message.senderName || message.userName}
            </span>
          )}
          
          <AudioPlayer
            audioUrl={`${import.meta.env.VITE_SERVER_URL}${message.audioUrl}`}
            duration={message.duration || 0}
            waveformData={message.waveformData || []}
            isOwn={isOwn}
          />
          
          <span className="text-xs text-text-light mt-1">
            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </motion.div>
    );
  }

  if (message.type === 'file') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
              {initials}
            </AvatarFallback>
          </Avatar>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwn && (
            <span className="text-xs text-text-light mb-1">
              {message.senderName || message.userName}
            </span>
          )}
          
          <FilePreview
            fileUrl={message.fileUrl}
            fileName={message.fileName}
            fileType={message.fileType}
            fileSize={message.fileSize}
            mimeType={message.mimeType}
            isOwn={isOwn}
          />
          
          <span className="text-xs text-text-light mt-1">
            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id={`message-${message._id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} group`}
    >
      {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
            {initials?.[0] || message.userName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-md`}>
        {showAvatar && !isOwn && (
          <span className="text-xs text-text-light mb-1">
            {message.senderName || message.userName}
          </span>
        )}
        
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-forest text-white rounded-tr-none'
                : 'bg-white dark:bg-card border rounded-tl-none'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content || message.message}
            </p>
            {message.isEdited && (
              <span className="text-xs opacity-70 ml-2">(edited)</span>
            )}
          </div>
          
          <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'}`}>
            <MessageActions
              message={message}
              isOwn={isOwn}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopy}
              onPin={onPin}
            />
          </div>
        </div>
        
        <MessageReactions
          messageId={message._id}
          reactions={message.reactions || {}}
          onReact={onReact}
          currentUserId={currentUserId}
          isOwn={isOwn}
        />

        {isOwn ? (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-text-light">
              {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <ReadReceipts message={message} currentUserId={currentUserId} />
          </div>
        ) : (
          <span className="text-xs text-text-light mt-1">
            {new Date(message.timestamp || message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default RoomChatPage;