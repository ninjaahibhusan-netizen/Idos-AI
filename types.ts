export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: WebSource;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  groundingChunks?: GroundingChunk[];
  timestamp: number;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}