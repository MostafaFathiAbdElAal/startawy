'use client';

import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '@/lib/store/useChatStore';

export const ChatButton = () => {
  const { isOpen, setIsOpen } = useChatStore();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 transition-colors"
      aria-label="Toggle Chat"
    >
      {isOpen ? (
        <X size={24} />
      ) : (
        <div className="relative">
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
        </div>
      )}
    </motion.button>
  );
};
