'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, User, Send, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface ChatSession {
  sessionId: string;
  userName?: string;
  userRole?: string;
  messages: { sender: 'user' | 'admin'; text: string; timestamp: string }[];
  lastMessage?: string;
  unread?: boolean;
  isTyping?: boolean;
}

export default function AdminSupportPage() {
  const socketRef = useRef<Socket | null>(null);
  const [activeChats, setActiveChats] = useState<Map<string, ChatSession>>(new Map());
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_selected_session');
    }
    return null;
  });
  const [replyText, setReplyText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null);

  // 🏆 Persistence: Save selected session on change
  useEffect(() => {
    if (selectedSessionId) {
      localStorage.setItem('admin_selected_session', selectedSessionId);
    } else {
      localStorage.removeItem('admin_selected_session');
    }
  }, [selectedSessionId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('--- ADMIN CONNECTED TO SOCKET ---');
      setIsConnected(true);
      newSocket.emit('admin_join', { adminName: 'Admin Support' });
    });

    newSocket.on('disconnect', () => {
      console.log('--- ADMIN DISCONNECTED ---');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('--- SOCKET CONNECTION ERROR ---', err);
      setIsConnected(false);
    });

    newSocket.on('new_user_assigned', ({ sessionId, userName }) => {
      setActiveChats(prev => {
        const next = new Map(prev);
        if (!next.has(sessionId)) {
          next.set(sessionId, { 
            sessionId, 
            userName, 
            userRole,
            messages: [] as { sender: 'user' | 'admin'; text: string; timestamp: string }[], 
            unread: true 
          });
        }
        return next;
      });
    });

    newSocket.on('user_message', ({ sessionId, text, timestamp }) => {
      setActiveChats(prev => {
        const next = new Map(prev);
        const session = next.get(sessionId) || { sessionId, messages: [] as { sender: 'user' | 'admin'; text: string; timestamp: string }[] };
        
        // 🛡️ Safeguard: Prevent duplicate messages
        const isDuplicate = session.messages.some(m => m.timestamp === timestamp && m.text === text);
        if (isDuplicate) return prev;

        const updatedMessages = [...session.messages, { sender: 'user', text, timestamp }];
        
        next.set(sessionId, { 
          ...session, 
          messages: updatedMessages,
          lastMessage: text,
          unread: true 
        } as ChatSession);
        return next;
      });
    });

    newSocket.on('user_typing', ({ sessionId, isTyping }) => {
      setActiveChats(prev => {
        const next = new Map(prev);
        const session = next.get(sessionId);
        if (session) {
          next.set(sessionId, { ...session, isTyping });
        }
        return next;
      });
    });

    interface SyncSession {
      sessionId: string;
      userName?: string;
      userRole?: string;
      messages: { sender: 'user' | 'admin'; text: string; timestamp: string }[];
    }

    // 🏆 Restoration logic: Syncing sessions and message history on join/refresh
    newSocket.on('active_sessions_sync', ({ sessions }: { sessions: SyncSession[] }) => {
      console.log('--- SYNCING ACTIVE SESSIONS ---', sessions);
      setActiveChats(prev => {
        const next = new Map(prev);
        sessions.forEach((s) => {
          // Only add if not already present or to update history on restore
          next.set(s.sessionId, {
            sessionId: s.sessionId,
            userName: s.userName,
            userRole: s.userRole,
            messages: s.messages || [],
            lastMessage: s.messages?.length > 0 ? s.messages[s.messages.length - 1].text : undefined,
            unread: false 
          });
        });
        return next;
      });
    });

    // 🏆 Multi-Admin Sync: Received a reply from another socket/instance
    newSocket.on('admin_reply_sync', ({ sessionId, text, timestamp }) => {
      console.log('--- SYNCED ADMIN REPLY ---', { sessionId, text });
      setActiveChats(prev => {
        const next = new Map(prev);
        const session = next.get(sessionId);
        if (session) {
          // 🛡️ Safeguard: Prevent duplicate messages
          const isDuplicate = session.messages.some(m => m.timestamp === timestamp && m.text === text);
          if (isDuplicate) return prev;

          const updatedMessages = [...session.messages, { sender: 'admin', text, timestamp }];
          next.set(sessionId, { ...session, messages: updatedMessages, lastMessage: text });
        }
        return next;
      });
    });

    // 🏆 Multi-Admin Sync: Chat was ended by another socket/instance
    newSocket.on('chat_ended_by_sync', ({ sessionId }) => {
      console.log('--- CHAT ENDED BY SYNC ---', sessionId);
      setActiveChats(prev => {
        const next = new Map(prev);
        next.delete(sessionId);
        return next;
      });
      setSelectedSessionId(prev => prev === sessionId ? null : prev);
    });


    return () => {
      newSocket.disconnect();
    };
  }, []); // Only connect on mount

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedSessionId, activeChats]);

  const handleSendReply = () => {
    if (socketRef.current && selectedSessionId && replyText.trim()) {
      socketRef.current.emit('admin_chat_reply', { sessionId: selectedSessionId, text: replyText });
      socketRef.current.emit('admin_chat_typing', { sessionId: selectedSessionId, isTyping: false });
      
      setActiveChats(prev => {
        const next = new Map(prev);
        const session = next.get(selectedSessionId);
        if (session) {
          // ✅ Immutable update: create a new array to avoid React Strict Mode double-add
          const updatedMessages = [
            ...session.messages,
            { sender: 'admin' as const, text: replyText, timestamp: new Date().toISOString() }
          ];
          next.set(selectedSessionId, { ...session, messages: updatedMessages });
        }
        return next;
      });

      
      setReplyText('');
      isTypingRef.current = false;
    }
  };

  const handleAdminTyping = (val: string) => {
    setReplyText(val);
    if (!selectedSessionId || !socketRef.current) return;

    // Emit typing status if not already set
    if (!isTypingRef.current && val.trim() !== '') {
      isTypingRef.current = true;
      socketRef.current.emit('admin_chat_typing', { sessionId: selectedSessionId, isTyping: true });
    }
    
    // Reset timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit('admin_chat_typing', { sessionId: selectedSessionId, isTyping: false });
    }, 1000);
  };

  const selectedChat = selectedSessionId ? activeChats.get(selectedSessionId) : null;

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {/* Sidebar: Chat List */}
      <div className="w-80 border-r border-gray-100 dark:border-slate-800 flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageCircle className="text-teal-600" />
              Support Chats
            </h2>
            <div className="flex items-center gap-2">
              <span className={clsx(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400">Manage active customer requests</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {activeChats.size === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-40">
              <Clock size={40} className="mb-2" />
              <p className="text-sm">No active chats yet</p>
            </div>
          ) : (
            Array.from(activeChats.values()).map(chat => (
              <button
                key={chat.sessionId}
                onClick={() => {
                  setSelectedSessionId(chat.sessionId);
                  chat.unread = false;
                }}
                className={clsx(
                  "w-full text-left p-4 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors border-b border-gray-50 dark:border-slate-800/50",
                  selectedSessionId === chat.sessionId && "bg-teal-50 dark:bg-teal-900/20"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full relative">
                      <User size={18} />
                      {chat.isTyping && (
                        <span className="absolute -bottom-1 -right-1 flex gap-0.5 px-1 py-0.5 bg-white dark:bg-slate-700 rounded-full shadow-sm border border-gray-100 dark:border-slate-600 scale-75">
                          <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                          <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-1 h-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{chat.userName || `User ${chat.sessionId.substring(0, 4)}`}</p>
                        {chat.userRole && (
                          <span className={clsx(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            chat.userRole === 'FOUNDER' ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          )}>
                            {chat.userRole}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate w-40">
                        {chat.isTyping ? <span className="text-teal-500 animate-pulse font-medium italic">typing...</span> : (chat.lastMessage || 'No messages')}
                      </p>
                    </div>
                  </div>
                  {chat.unread && <span className="w-2 h-2 bg-teal-500 rounded-full"></span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-slate-900/30">
        {selectedChat ? (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-full text-teal-600">
                  <User size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{selectedChat.userName || `User ${selectedChat.sessionId}`}</h3>
                    {selectedChat.userRole && (
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        selectedChat.userRole === 'FOUNDER' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {selectedChat.userRole}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-green-500 flex items-center gap-1">
                    <CheckCircle2 size={10} /> {selectedChat.isTyping ? 'User is typing...' : 'Active Session'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {confirmEndId === selectedSessionId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-500 font-bold animate-pulse">ARE YOU SURE?</span>
                    <button
                      onClick={() => {
                        socketRef.current?.emit('admin_end_chat', { sessionId: selectedSessionId! });
                        setActiveChats(prev => {
                          const next = new Map(prev);
                          next.delete(selectedSessionId!);
                          return next;
                        });
                        setSelectedSessionId(null);
                        setConfirmEndId(null);
                      }}
                      className="px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                    >
                      CLICK TO END
                    </button>
                    <button
                      onClick={() => setConfirmEndId(null)}
                      className="px-3 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 rounded-lg"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmEndId(selectedSessionId)}
                    className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-100 dark:border-red-900/50"
                  >
                    End Chat
                  </button>
                )}
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={clsx(
                    "flex flex-col max-w-[70%]",
                    msg.sender === 'admin' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={clsx(
                    "p-3 rounded-2xl text-sm",
                    msg.sender === 'admin' 
                      ? "bg-teal-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm border border-gray-100 dark:border-slate-700"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => handleAdminTyping(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type your reply..."
                  className="flex-1 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl outline-none text-sm border border-transparent focus:border-teal-500/50 transition-all"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-lg shadow-teal-600/20"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <MessageCircle size={60} className="mb-4" />
            <p className="text-lg font-medium">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
