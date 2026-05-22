import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore, Message } from '@/lib/store/useChatStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useChatSocket = (userName?: string, userRole?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const { sessionId, setSessionId, addMessage, setQueuePosition, setAdminStatus, setIsAdminTyping } = useChatStore();

  useEffect(() => {
    if (!sessionId) return;

    // 🔄 NEW: Fetch history from DB to ensure sync
    const syncHistory = async () => {
      try {
        const SECRET_KEY = 'STARTAWY_SECRET_123456'; 
        const res = await fetch(`/api/support/messages?sessionId=${sessionId}`, {
          headers: { 'x-secret-key': SECRET_KEY }
        });
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          // Only add messages that aren't already in the store
          data.messages.forEach((m: { text: string; createdAt: string; sender: string; id: number | string }) => {
            const exists = useChatStore.getState().messages.some(msg => 
              msg.text === m.text && msg.timestamp === m.createdAt
            );
            if (!exists) {
              addMessage({
                id: m.id.toString(),
                sender: m.sender as 'user' | 'admin' | 'system',
                text: m.text,
                timestamp: m.createdAt
              });
            }
          });
        }
      } catch (err) {
        console.error('History sync failed:', err);
      }
    };

    syncHistory();

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
        text: 'Conversation ended',
        timestamp: new Date().toISOString(),
      });
      setAdminStatus('offline');
      // Do NOT auto-generate a new session ID here - that caused immediate re-queuing.
      // A new session ID is generated only when the user closes and reopens the widget.
    });

    // Listen for admin typing
    socket.on('support_typing', (data: { isTyping: boolean }) => {
      setIsAdminTyping(data.isTyping);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, setSessionId, addMessage, setQueuePosition, setAdminStatus, setIsAdminTyping, userName, userRole]);

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
