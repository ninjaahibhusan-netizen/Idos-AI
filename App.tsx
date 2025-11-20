import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles, Trash2, Github, ExternalLink, Search } from 'lucide-react';
import { ChatMessage, Role, ChatState } from './types';
import { createChatSession, sendMessageStream } from './services/gemini';
import { ChatMessage as MessageComponent } from './components/ChatMessage';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const [inputValue, setInputValue] = useState('');
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
      // Add initial welcome message
      setChatState(prev => ({
        ...prev,
        messages: [{
          id: 'welcome',
          role: Role.MODEL,
          text: "Greetings. I am the **IDOS Deep Research AI**. \n\nI'm connected to real-time data sources to help you navigate the IDOS ecosystem, decentralized identity standards, and access management protocols.\n\nWhat would you like to research today?",
          timestamp: Date.now()
        }]
      }));
    } catch (e) {
      setChatState(prev => ({ ...prev, error: "Failed to initialize AI session. Check API Key." }));
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleClearChat = () => {
    chatSessionRef.current = createChatSession();
    setChatState({
      messages: [{
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Chat memory cleared. Ready for a new research topic.",
        timestamp: Date.now()
      }],
      isLoading: false,
      error: null,
    });
  };

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !chatSessionRef.current || chatState.isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: userMessageText,
      timestamp: Date.now(),
    };

    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: Role.MODEL,
      text: '',
      isStreaming: true,
      timestamp: Date.now() + 1,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage, initialBotMessage],
      isLoading: true,
      error: null
    }));

    try {
      await sendMessageStream(
        chatSessionRef.current,
        userMessageText,
        (text, groundingChunks) => {
          setChatState(prev => {
            const newMessages = [...prev.messages];
            const msgIndex = newMessages.findIndex(m => m.id === botMessageId);
            if (msgIndex !== -1) {
              newMessages[msgIndex] = {
                ...newMessages[msgIndex],
                text: text,
                groundingChunks: groundingChunks || newMessages[msgIndex].groundingChunks
              };
            }
            return { ...prev, messages: newMessages };
          });
        }
      );
    } catch (err: any) {
      setChatState(prev => ({
        ...prev,
        error: err.message || "An error occurred while fetching data."
      }));
    } finally {
      setChatState(prev => {
        const newMessages = [...prev.messages];
        const msgIndex = newMessages.findIndex(m => m.id === botMessageId);
        if (msgIndex !== -1) {
          newMessages[msgIndex] = { ...newMessages[msgIndex], isStreaming: false };
        }
        return { ...prev, isLoading: false };
      });
    }
  }, [inputValue, chatState.isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-idos-900 text-gray-100 font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-idos-800 via-idos-900 to-black">
      
      {/* Header */}
      <header className="flex-shrink-0 border-b border-idos-700/50 bg-idos-900/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-idos-accent to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-idos-900 rounded-full p-2 border border-idos-700">
                <Bot className="w-6 h-6 text-idos-accent" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
                IDOS <span className="text-idos-accent">AI</span>
              </h1>
              <p className="text-[10px] font-mono text-idos-400 uppercase tracking-widest">Deep Research Protocol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a href="https://idos.network" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-idos-800 border border-idos-700 text-xs hover:border-idos-accent hover:text-idos-accent transition-colors">
              <span>idos.network</span>
              <ExternalLink size={10} />
            </a>
            <button 
              onClick={handleClearChat}
              className="p-2 rounded-lg hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-grow overflow-y-auto relative scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-full flex flex-col">
          {chatState.messages.map((msg) => (
            <MessageComponent key={msg.id} message={msg} />
          ))}
          
          {chatState.isLoading && chatState.messages[chatState.messages.length - 1].role === Role.USER && (
            <div className="mb-8 animate-in fade-in duration-500">
              <ThinkingIndicator />
            </div>
          )}
          
          {chatState.error && (
            <div className="p-4 mb-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {chatState.error}
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 p-4 bg-gradient-to-t from-idos-900 via-idos-900 to-transparent pb-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-idos-600 via-idos-accent to-idos-600 rounded-2xl opacity-20 blur transition duration-1000 group-hover:opacity-100"></div>
          <div className="relative flex items-end gap-2 bg-idos-800/90 backdrop-blur-xl rounded-xl border border-idos-600/30 p-2 shadow-2xl">
            
            <div className="flex-grow relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about IDOS, Identity Standards, or Research topics..."
                className="w-full bg-transparent text-gray-100 placeholder-gray-500 text-base px-4 py-3 focus:outline-none resize-none max-h-[200px] scrollbar-thin scrollbar-thumb-idos-600"
                rows={1}
                disabled={chatState.isLoading}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatState.isLoading}
              className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                inputValue.trim() && !chatState.isLoading
                  ? 'bg-idos-accent text-idos-900 hover:bg-white shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                  : 'bg-idos-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {chatState.isLoading ? (
                <div className="animate-spin w-5 h-5 border-2 border-idos-900 border-t-transparent rounded-full" />
              ) : (
                <Send size={20} strokeWidth={2.5} />
              )}
            </button>
          </div>
          <div className="text-center mt-3">
             <p className="text-[10px] text-idos-500 flex items-center justify-center gap-1">
               <Search size={10} />
               Powered by Gemini 2.5 • Real-time Search Grounding Active
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;