import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType, Role } from '../types';
import { User, Bot, Sparkles } from 'lucide-react';
import { SourceCard } from './SourceCard';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full gap-4 mb-8 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg 
        ${isUser 
          ? 'bg-gradient-to-br from-gray-600 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-idos-600 to-idos-900 text-idos-accent border border-idos-600/50'
        }`}>
        {isUser ? <User size={20} /> : <Sparkles size={20} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-1 opacity-50 text-xs font-mono">
          <span>{isUser ? 'You' : 'IDOS Research AI'}</span>
          <span>•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Bubble */}
        <div className={`relative px-6 py-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-xl overflow-hidden
          ${isUser 
            ? 'bg-idos-700 text-white rounded-tr-none' 
            : 'bg-idos-800/80 backdrop-blur-md border border-idos-700/50 text-gray-200 rounded-tl-none'
          }`}>
            
          {/* Markdown Content */}
          <div className="markdown-body prose prose-invert prose-p:leading-7 prose-li:marker:text-idos-accent max-w-none">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => <a {...props} className="text-idos-accent hover:underline font-medium" target="_blank" rel="noopener noreferrer" />,
                code: ({ node, ...props }) => {
                    // Separate inline code from block code
                    // Using a simple check on children/props usually done by checking if it is inline
                    const match = /language-(\w+)/.exec(props.className || '')
                    return match ? (
                        <div className="relative my-4 rounded-lg bg-black/30 p-4 border border-idos-700 overflow-x-auto">
                            <code {...props} className="font-mono text-sm text-blue-200" />
                        </div>
                    ) : (
                        <code {...props} className="font-mono text-xs bg-idos-900/50 px-1.5 py-0.5 rounded text-idos-accent" />
                    )
                },
                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 space-y-2 my-3" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 space-y-2 my-3" />,
                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-idos-600 pl-4 italic text-gray-400 bg-idos-900/30 py-2 pr-2 rounded-r" />,
                h3: ({node, ...props}) => <h3 {...props} className="text-lg font-semibold text-white mt-6 mb-2" />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
        </div>

        {/* Grounding Sources (Research Results) */}
        {!isUser && message.groundingChunks && message.groundingChunks.length > 0 && (
          <div className="mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-grow bg-idos-700"></div>
              <span className="text-xs font-mono text-idos-400 uppercase tracking-wider bg-idos-900/50 px-2 py-1 rounded border border-idos-800">
                {message.groundingChunks.length} Sources Found
              </span>
              <div className="h-px flex-grow bg-idos-700"></div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x w-full">
              {message.groundingChunks.map((chunk, idx) => (
                chunk.web ? <SourceCard key={idx} source={chunk.web} index={idx} /> : null
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};