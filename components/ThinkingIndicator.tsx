import React from 'react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 rounded-2xl bg-idos-800/50 border border-idos-600/30 w-fit max-w-[200px] animate-pulse">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-idos-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-idos-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-idos-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-xs font-mono text-idos-accent/80 uppercase tracking-wider">Researching...</span>
    </div>
  );
};