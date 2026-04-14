"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!res.ok) throw new Error("API error");
      
      const data = await res.json();
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">StartBot - AI Financial Advisor</h1>
        <p className="text-gray-600 dark:text-gray-400">Ask me anything about your business finances and strategy</p>
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
                className={`max-w-2xl rounded-2xl px-6 py-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-tr-sm"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-200 rounded-tl-sm border border-gray-200 dark:border-slate-700"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
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
        <div className="border-t border-gray-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 rounded-b-2xl shrink-0">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          {/* Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "💡 Optimize budget",
              "📊 Market trends",
              "💰 Increase revenue",
              "👥 Get consultant advice"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion.slice(3))} // Remove icon
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm shadow-sm hover:shadow"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
