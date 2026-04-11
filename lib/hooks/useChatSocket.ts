import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore, Message } from '@/lib/store/useChatStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useChatSocket = (userName?: string, userRole?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const { sessionId, setSessionId, addMessage, setQueuePosition, setAdminStatus, setIsAdminTyping } = useChatStore();

  useEffect(() => {
    if (!sessionId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    // Join support room
    socket.emit('join_support', { sessionId, userName, userRole });

    // Listen for incoming messages
    socket.on('support_reply', (data: { text: string; senderName?: string }) => {
      const newMessage: Message = {
        // eslint-disable-next-line react-hooks/purity
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        sender: 'admin',
        text: data.text,
        timestamp: new Date().toISOString(),
      };
      addMessage(newMessage);
    });

    // Listen for queue updates
    socket.on('queue_update', (data: { position: number | null }) => {
      setQueuePosition(data.position);
    });

    // Listen for admin status
    socket.on('admin_status', (data: { status: 'online' | 'offline' | 'busy' }) => {
      setAdminStatus(data.status);
    });

    // Listen for chat ending
    socket.on('chat_ended', () => {
      addMessage({
        // eslint-disable-next-line react-hooks/purity
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        sender: 'system',
        text: 'Previous conversation ended',
        timestamp: new Date().toISOString(),
      });
      setAdminStatus('offline');
      // Generate new session ID so the next message is treated as a clean slate by the backend
      setSessionId(Math.random().toString(36).substring(2, 11));
    });

    // Listen for admin typing
    socket.on('support_typing', (data: { isTyping: boolean }) => {
      setIsAdminTyping(data.isTyping);
    });

    // Clean up on unmount
    return () => {
      socket.disconnect();
    };
  }, [sessionId, setSessionId, addMessage, setQueuePosition, setAdminStatus, setIsAdminTyping, userName]);

  const sendMessage = (text: string) => {
    if (socketRef.current && text.trim()) {
      const newMessage: Message = {
        // eslint-disable-next-line react-hooks/purity
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
      };
      
      addMessage(newMessage);
      socketRef.current.emit('website_chat_msg', { 
        sessionId,
        userName, 
        userRole,
        text 
      });
      // Stop typing immediately on send
      sendTypingStatus(false);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit('website_typing', { sessionId, isTyping });
    }
  };

  return { sendMessage, sendTypingStatus };
};
