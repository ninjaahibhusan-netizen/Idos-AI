import React from 'react';
import { WebSource } from '../types';
import { ExternalLink, Globe } from 'lucide-react';

interface SourceCardProps {
  source: WebSource;
  index: number;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source, index }) => {
  // Truncate title if too long
  const title = source.title.length > 50 ? source.title.substring(0, 47) + '...' : source.title;
  // Extract domain for cleaner display
  let domain = '';
  try {
    domain = new URL(source.uri).hostname.replace('www.', '');
  } catch (e) {
    domain = 'Source';
  }

  return (
    <a 
      href={source.uri} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group flex flex-col p-3 rounded-lg bg-idos-900 border border-idos-700 hover:border-idos-accent transition-all duration-200 min-w-[200px] max-w-[240px] flex-shrink-0 snap-start"
    >
      <div className="flex items-center gap-2 mb-2 text-idos-400 group-hover:text-idos-accent transition-colors">
        <div className="p-1 rounded bg-idos-800">
          <Globe size={12} />
        </div>
        <span className="text-xs font-mono opacity-70 truncate">{domain}</span>
      </div>
      <div className="text-sm font-medium text-gray-200 leading-tight mb-2 line-clamp-2 h-10">
        {title}
      </div>
      <div className="mt-auto pt-2 flex items-center text-xs text-idos-500 group-hover:text-white transition-colors gap-1">
        <span>Read Source</span>
        <ExternalLink size={10} />
      </div>
    </a>
  );
};