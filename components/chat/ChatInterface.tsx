"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/providers/ToastProvider";

export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatInterfaceProps = {
  initialHistory: Message[];
};

export function ChatInterface({ initialHistory }: ChatInterfaceProps) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialHistory.map(m => ({...m, timestamp: new Date(m.timestamp)})));
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            message: userMessage.content,
            isSuggestion: !!customMessage 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Plan Limit Reached") {
          showToast({
            type: "warning",
            title: "Plan Limit Reached",
            message: data.message || "Please upgrade your plan to continue using AI advisory."
          });
          
          const limitMsg: Message = {
            id: Date.now() + 1,
            role: "assistant",
            content: "✨ You've reached your free plan limit. Please upgrade to a Basic or Premium plan to unlock unlimited financial guidance!",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, limitMsg]);
          return;
        }
        throw new Error(data.error || "API error");
      }
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: unknown) {
      console.error("Chat error:", error);
      
      showToast({
          type: "error",
          title: "Connection Failed",
          message: "An error occurred while fetching the response. Please try again later."
      });

      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-4 sm:mb-6 shrink-0 text-center md:text-left">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">StartBot - AI Financial Advisor</h1>
        <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 font-medium">Ask me anything about your business finances and strategy</p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-200 rounded-tl-sm border border-gray-200 dark:border-slate-700"
                }`}
              >
                <div className="leading-relaxed prose prose-xs sm:prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <p
                  className={`text-[10px] mt-1.5 font-medium ${
                    message.role === "user" ? "text-teal-100" : "text-gray-500 dark:text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 bg-linear-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 bg-linear-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-6 py-4 rounded-tl-sm border border-gray-200 dark:border-slate-700 shadow-sm">
                <div className="flex gap-1.5 pt-2 pb-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-slate-800 p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-b-2xl shrink-0">
          <div className="flex gap-2 sm:gap-4 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 min-w-0 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-4 sm:px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-black flex items-center gap-2 shrink-0"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Send</span>
            </button>
          </div>
          
          {/* Suggestions - Scrollable on mobile */}
          <div className="mt-4 flex overflow-x-auto no-scrollbar sm:flex-wrap gap-2 pb-1 -mx-2 px-2">
            {[
              { icon: "💡", text: "Optimize budget" },
              { icon: "📊", text: "Market trends" },
              { icon: "💰", text: "Increase revenue" },
              { icon: "👥", text: "Consultant advice" }
            ].map((suggestion) => (
              <button
                key={suggestion.text}
                onClick={() => handleSend(suggestion.text)}
                disabled={isTyping}
                className="whitespace-nowrap px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:border-teal-200 dark:hover:border-teal-800 transition-all text-xs font-bold shadow-sm shrink-0"
              >
                <span className="mr-1.5">{suggestion.icon}</span>
                {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
