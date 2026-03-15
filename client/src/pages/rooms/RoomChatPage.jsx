// src/pages/rooms/RoomChatPage.jsx - Full Chat Interface
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Users,
  MoreVertical,
  Info,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import ReadReceipts from '@/components/chat/ReadReceipts';
import { getAvatarColor, getInitials } from '@/utils/avatarColors';
import { Mic } from 'lucide-react';  
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import AudioPlayer from '@/components/chat/AudioPlayer';
import MessageReactions from '@/components/chat/MessageReactions';
import MessageActions from '@/components/chat/MessageActions';
import { Paperclip } from 'lucide-react';
import { Search } from 'lucide-react';
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
    loadRoom();
    loadMessages();
  }, [roomId]);

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
    console.log('👤 Current user:', user);

    // Join room
    socket.emit('join-room', roomId);

    // Listen for new messages
    socket.on('receive-message', (message) => {
      console.log('📩 Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Listen for user joined/left
    socket.on('user-joined', (data) => {
      console.log('👋 User joined:', data);
      const systemMessage = {
        _id: Date.now().toString(),
        type: 'system',
        content: `${data.userName} joined the room`,
        timestamp: data.timestamp
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on('user-left', (data) => {
      console.log('👋 User left event received:');
      console.log('   userId:', data.userId);
      console.log('   userName:', data.userName);
      console.log('   timestamp:', data.timestamp);
      
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
      console.log('👥 Online count updated:', data.count);
      setOnlineCount(data.count);
    });

    // Typing indicators
    socket.on('user-typing', (data) => {
      console.log('⌨️ User typing:', data);
      setTypingUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('user-stopped-typing', (data) => {
      console.log('⌨️ User stopped typing:', data.userId);
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

        // Listen for reactions
    socket.on('message-reacted', (data) => {
    console.log('👍 Message reacted:', data);
    setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
        ? { ...msg, reactions: data.reactions }
        : msg
    ));
    });

    // Listen for edits
    socket.on('message-edited', (data) => {
    console.log('✏️ Message edited:', data);
    setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
        ? { ...msg, content: data.content, message: data.content, isEdited: true, editedAt: data.editedAt }
        : msg
    ));
    });

    // Listen for deletes
    socket.on('message-deleted', (data) => {
    console.log('🗑️ Message deleted:', data);
    setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Listen for pins
    socket.on('message-pinned', (data) => {
      console.log('📌 Message pinned:', data);
      setMessages(prev => prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, isPinned: data.isPinned, pinnedAt: data.pinnedAt }
          : msg
      ));
      
      // Reload pinned messages in PinnedMessages component
      window.dispatchEvent(new Event('reload-pinned'));
    });

// In cleanup:
socket.off('message-pinned');

    // Listen for read receipts
    socket.on('messages-read', (data) => {
    console.log('📖 Messages read:', data);
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

  // In cleanup:
  socket.off('messages-read');

    // Cleanup
    return () => {
      socket.emit('leave-room', roomId);
      socket.off('receive-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('room-users-update');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  }, [socket, roomId, user]);

  useEffect(() => {
    if (!socket || !messages.length) return;

    // Mark visible messages as read
    const unreadMessages = messages.filter(
      msg => msg.userId !== user?.id && 
      msg.type !== 'system' &&
      (!msg.readBy || !msg.readBy.some(r => r.user === user?.id))
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(m => m._id);
      
      // Mark as read in backend
      const token = localStorage.getItem('token');
      axios.post(
        `https://tlearn-upgraded.vercel.app/api/messages/room/${roomId}/read`,
        { messageIds },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => console.error('Failed to mark as read:', err));
    }
  }, [messages, user?.id, socket, roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRoom = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://tlearn-upgraded.vercel.app/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(response.data);
    } catch (error) {
      toast.error('Failed to load room');
      navigate('/rooms');
    } finally {
      setLoading(false);
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

  const loadMessages = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`https://tlearn-upgraded.vercel.app/api/messages/room/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    // Normalize messages from database
    const dbMessages = (response.data.messages || []).map(msg => ({
        _id: msg._id,
        userId: msg.sender?._id || msg.sender,
        userName: msg.senderName || msg.sender?.name,
        message: msg.content,
        content: msg.content,
        type: msg.type || 'text',
        timestamp: msg.createdAt,
        createdAt: msg.createdAt,
        // Audio fields
        audioUrl: msg.audioUrl,
        duration: msg.duration,
        waveformData: msg.waveformData || [],
        // File fields - ADD THESE 5 LINES!
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileType: msg.fileType,
        fileSize: msg.fileSize,
        mimeType: msg.mimeType,
        // Polish fields
        reactions: msg.reactions || {},
        isEdited: msg.isEdited,
        editedAt: msg.editedAt
        }));
        
        console.log('📚 Loaded', dbMessages.length, 'messages from DB');
        console.log('👤 Current user ID:', user?.id);
        
        setMessages(dbMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
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
      const token = localStorage.getItem('token');
      await axios.post(
        `https://tlearn-upgraded.vercel.app/api/messages/room/${roomId}`,
        { content: messageContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to save message:', error);
    }

    // Stop typing indicator
    socket.emit('typing-stop', roomId);
  };

  

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!socket) return;

    // Send typing indicator
    socket.emit('typing-start', roomId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
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

        const token = localStorage.getItem('token');
        await axios.post(
        `https://tlearn-upgraded.vercel.app/api/audio/room/${roomId}`,
        formData,
        {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
            }
        }
        );

        setShowVoiceRecorder(false);
        toast.success('Voice message sent!');
    } catch (error) {
        console.error('Failed to send voice message:', error);
        toast.error('Failed to send voice message');
    }
};  

    const handleReact = async (messageId, emoji) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(
        `https://tlearn-upgraded.vercel.app/api/messages/${messageId}/react`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const token = localStorage.getItem('token');
        await axios.patch(
        `https://tlearn-upgraded.vercel.app/api/messages/${editingMessage._id}`,
        { content: editText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
        );
        
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
        const token = localStorage.getItem('token');
        await axios.delete(
        `https://tlearn-upgraded.vercel.app/api/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
        );
        
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
      const token = localStorage.getItem('token');
      await axios.post(
        `https://tlearn-upgraded.vercel.app/api/rooms/${roomId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Left room');
      navigate('/rooms');
    } catch (error) {
      toast.error('Failed to leave room');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handlePin = async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://tlearn-upgraded.vercel.app/api/messages/${messageId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to pin message:', error);
      toast.error('Failed to pin message');
    }
  };

  const handleSendFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    await axios.post(
      `https://tlearn-upgraded.vercel.app/api/files/room/${roomId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setShowFileUploader(false);
    toast.success('File sent!');
  } catch (error) {
    console.error('Failed to send file:', error);
    toast.error('Failed to send file');
  }
};

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
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSearch(true)}
            >
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
              // Skip system messages for ownership check
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
              
              // DEBUG: Log each message to see what we're getting
              const messageUserId = message.userId || message.sender?._id || message.sender;
              const currentUserId = user?.id;
              const isOwn = messageUserId === currentUserId;
              
              if (index === messages.length - 1) { // Only log last message to avoid spam
                console.log('💬 Last message userId:', messageUserId);
                console.log('💬 Current user ID:', currentUserId);
                console.log('💬 Are they equal?', isOwn);
                console.log('💬 Message userName:', message.userName || message.senderName);
              }
              
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
            // Editing Mode
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
            // Normal Mode
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

// Message Bubble Component
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

    // System messages (user joined/left)
    if (message.type === 'system') {
    return (
        <div className="flex justify-center">
        <span className="text-xs text-text-light bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
            {message.content}
        </span>
        </div>
    );
    // DEBUG: Check if reactions exist

  }
    if (message.type === 'text') {
        console.log('🎨 Message:', message.content?.substring(0, 20), 'Reactions:', message.reactions);
    }
  // Regular chat messages
  // Handle audio messages
  if (message.type === 'audio') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        {showAvatar && !isOwn && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-forest text-white text-sm">
              {message.senderName?.[0] || message.userName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}

        {/* Audio Player */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {showAvatar && !isOwn && (
            <span className="text-xs text-text-light mb-1">
              {message.senderName || message.userName}
            </span>
          )}
          
          <AudioPlayer
            audioUrl={`http://localhost:5000${message.audioUrl}`}
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

  // File messages
    if (message.type === 'file') {
    return (
        <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
        >
        {/* Avatar */}
        {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}

        {/* File Preview */}
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
        {/* Avatar */}
        {showAvatar && !isOwn && (
        <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className={`${avatarColor} text-white text-xs font-semibold`}>
            {initials?.[0] || message.userName?.[0] || 'U'}
            </AvatarFallback>
        </Avatar>
        )}
        {!showAvatar && !isOwn && <div className="w-8" />}
        
        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-md`}>
        {showAvatar && !isOwn && (
            <span className="text-xs text-text-light mb-1">
            {message.senderName || message.userName}
            </span>
        )}
        
        {/* Message Bubble with Actions */}
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
            
            {/* Actions Button */}
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
        
        {/* Reactions */}
        <MessageReactions
            messageId={message._id}
            reactions={message.reactions || {}}
            onReact={onReact}
            currentUserId={currentUserId}
            isOwn={isOwn}
        />

        {/* Timestamp with Read Receipts - REPLACE THE SPAN WITH THIS */}
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