'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Headset, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import { useChatStore } from '@/lib/store/useChatStore';
import { useChatSocket } from '@/lib/hooks/useChatSocket';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatChatDate, isSameDay } from '@/lib/utils/date-formatter';

interface ChatWindowProps {
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  userName?: string;
  userRole?: string;
}

export const ChatWindow = ({ isAuthenticated, isPhoneVerified, userName, userRole }: ChatWindowProps) => {
  const { isOpen, messages, queuePosition, adminStatus, setIsOpen, isAdminTyping } = useChatStore();
  const { sendMessage, sendTypingStatus } = useChatSocket(userName, userRole);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isAdminTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    
    // Resume typing status if not already set
    if (!isTypingRef.current && val.trim() !== '') {
      isTypingRef.current = true;
      sendTypingStatus(true);
    }

    // Reset timeout to stop typing status after 1 second of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStatus(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-teal-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Headset size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Customer Support</h3>
                <div className="flex items-center gap-1.5 text-[10px] opacity-90">
                  <span className={clsx(
                    "w-2 h-2 rounded-full",
                    adminStatus === 'online' ? "bg-green-400" : adminStatus === 'busy' ? "bg-yellow-400" : "bg-gray-400"
                  )} />
                  {adminStatus.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {!isAuthenticated ? (
            /* Login Required View */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center text-teal-600">
                <LogIn size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Login Required</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Please log in to your account to start a conversation with our support team.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                Go to Login
              </Link>
            </div>
          ) : !isPhoneVerified ? (
            /* Phone Verification Required View */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center text-amber-600">
                <ShieldAlert size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Verification Required</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  For security reasons, please verify your phone number to access our support team.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]"
              >
                Verify Phone Number
              </button>
            </div>
          ) : (
            /* Chat Messages View */
            <>
              <div className="text-center p-3 text-sm text-teal-800 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300 rounded-lg mx-4 mt-2">
                A support representative will assist you shortly.
              </div>
              
              <div 
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 scroll-smooth"
              >
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                    <MessageCirclePulse />
                    <p className="text-sm font-medium">Hello! How can we help you today?</p>
                  </div>
                )}

                {messages.map((msg, idx) => {
                  const showDate = idx === 0 || !isSameDay(msg.timestamp, messages[idx - 1].timestamp);

                  if (msg.sender === 'system') {
                    return (
                      <div key={msg.id} className="space-y-4">
                        {showDate && (
                          <div className="flex justify-center my-6">
                            <div className="bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-[10px] font-extrabold px-4 py-1.5 rounded-full shadow-sm">
                              {formatChatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div className="flex justify-center my-4">
                          <div className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-widest text-center px-6">
                            ————— {msg.text} —————
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="space-y-4">
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <div className="bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-[10px] font-extrabold px-4 py-1.5 rounded-full shadow-sm">
                            {formatChatDate(msg.timestamp)}
                          </div>
                        </div>
                      )}
                      <div
                        className={clsx(
                          "flex flex-col max-w-[80%] wrap-break-word",
                          msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div className={clsx(
                          "p-3 rounded-2xl shadow-sm",
                          msg.sender === 'user' 
                            ? "bg-teal-600 text-white rounded-tr-none" 
                            : "bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-tl-none"
                        )}>
                          <span className="font-semibold text-xs mb-1 block opacity-80">
                            {msg.sender === 'user' ? 'You' : 'Support'}
                          </span>
                          <p className="text-sm wrap-break-word whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Admin Typing Indicator */}
                {isAdminTyping && (
                  <div className="mr-auto items-start flex flex-col max-w-[80%]">
                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1 justify-center items-center h-4 w-8">
                        <motion.span 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                        />
                        <motion.span 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                        />
                        <motion.span 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                          className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Queue Status */}
                {queuePosition !== null && (
                  <div className="flex flex-col items-center justify-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-800/50">
                    <Loader2 className="animate-spin text-teal-600 mb-2" size={20} />
                    <p className="text-xs font-medium text-teal-800 dark:text-teal-300">
                      You are next in queue: <span className="font-bold">#{queuePosition}</span>
                    </p>
                    <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 mt-1">
                      Waiting for an admin to join...
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-1 placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MessageCirclePulse = () => (
  <div className="relative">
    <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-20"></div>
    <div className="relative bg-teal-100 dark:bg-teal-900/30 p-4 rounded-full">
      <Headset className="text-teal-600" size={32} />
    </div>
  </div>
);
