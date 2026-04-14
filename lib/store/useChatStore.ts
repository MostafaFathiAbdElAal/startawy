import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  sender: 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
}

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  sessionId: string;
  queuePosition: number | null;
  adminStatus: 'online' | 'offline' | 'busy';
  isAdminTyping: boolean;
  setSessionId: (id: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  startNewSession: () => void;
  addMessage: (message: Message) => void;
  setQueuePosition: (position: number | null) => void;
  setAdminStatus: (status: 'online' | 'offline' | 'busy') => void;
  setIsAdminTyping: (isTyping: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [],
      sessionId: typeof window !== 'undefined' 
        ? (localStorage.getItem('chat-session-id') || Math.random().toString(36).substring(2, 11))
        : '',
      setSessionId: (id) => set({ sessionId: id }),
      queuePosition: null,
      adminStatus: 'offline',
      isAdminTyping: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),

      // Generate a fresh session ID and clear history for a new conversation
      startNewSession: () => set({
        sessionId: Math.random().toString(36).substring(2, 11),
        messages: [],
        queuePosition: null,
        adminStatus: 'offline',
      }),
      
      addMessage: (message) => set((state) => ({ 
        messages: [...state.messages, message] 
      })),
      
      setQueuePosition: (position) => set({ queuePosition: position }),
      
      setAdminStatus: (status) => set({ adminStatus: status }),

      setIsAdminTyping: (isTyping) => set({ isAdminTyping: isTyping }),
      
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({ messages: state.messages, sessionId: state.sessionId }),
    }
  )
);
