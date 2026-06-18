import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import {
  ChatBubbleLeftRightIcon, PaperAirplaneIcon,
  XMarkIcon, CpuChipIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

const Chatbot = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      message: "Hi! I'm your AI Student Assistant 🎓\n\nI can help you with:\n• Attendance status\n• Fee information\n• Assignment deadlines\n• Exam schedules\n• Marks & grades\n\nType your question to get started!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', message: text, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await chatbotService.sendMessage(text, conversationId);
      setConversationId(data.conversation_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: data.response,
        timestamp: new Date().toISOString()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      message: "Chat cleared! How can I help you? 😊",
      timestamp: new Date().toISOString()
    }]);
    setConversationId(null);
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('•') || line.startsWith('-')) {
        return <div key={i} className="ml-2">{line}</div>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={i} className="font-semibold">{line.replace(/\*\*/g, '')}</div>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={i}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          </div>
        );
      }
      return line ? <div key={i}>{line}</div> : <br key={i} />;
    });
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        {isOpen
          ? <XMarkIcon className="w-6 h-6" />
          : <ChatBubbleLeftRightIcon className="w-6 h-6" />
        }
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-600 rounded-t-2xl">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <CpuChipIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">AI Student Assistant</p>
              <p className="text-primary-100 text-xs">Always here to help</p>
            </div>
            <button onClick={clearChat} title="Clear chat" className="text-primary-100 hover:text-white transition-colors">
              <ArrowPathIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}>
                  <div className="whitespace-pre-line">{formatMessage(msg.message)}</div>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['My attendance', 'Fee status', 'Upcoming exams', 'Assignments due'].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
