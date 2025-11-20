import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Role, GroundingChunk } from "../types";

// Initialize the Gemini API client
// Using the process.env.API_KEY as strictly required
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use gemini-2.5-flash for its speed and excellent tool use (grounding) capabilities
// It strikes the best balance for a "Research" bot that needs to search the web.
const MODEL_NAME = 'gemini-2.5-flash';

export const createChatSession = () => {
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      temperature: 0.7,
      // Enable Google Search Grounding for "Deep Research" capabilities
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the IDOS Deep Research Assistant. 
      IDOS (Identity Operating System) is a decentralized identity solution and access management layer for Web3.
      
      Your goal is to provide deep, well-researched answers about IDOS, blockchain identity, zero-knowledge proofs, and related Web3 topics.
      
      Guidelines:
      1. ALWAYS prioritize accuracy. Use the Google Search tool to verify the latest information about IDOS Network.
      2. If you use search results, the system will automatically cite them. Reference them naturally in your text.
      3. Format your responses using clear Markdown:
         - Use bolding for key terms.
         - Use lists for steps or features.
         - Use code blocks for technical integration examples.
      4. Be concise but comprehensive. "Deep Research" means synthesizing information, not just listing links.
      5. Maintain a professional, technical, yet accessible tone suitable for developers and crypto-natives.
      `,
    },
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string, 
  onChunk: (text: string, grounding?: GroundingChunk[]) => void
): Promise<void> => {
  try {
    const resultStream = await chat.sendMessageStream({ message });

    let fullText = "";
    let accumulatedGrounding: GroundingChunk[] = [];

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      
      // Extract text
      const textChunk = c.text || "";
      fullText += textChunk;

      // Extract grounding metadata if present in this chunk
      // The structure is candidates[0].groundingMetadata.groundingChunks
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
      
      if (groundingChunks && groundingChunks.length > 0) {
        accumulatedGrounding = [...accumulatedGrounding, ...groundingChunks];
      }

      // Propagate update
      onChunk(fullText, accumulatedGrounding.length > 0 ? accumulatedGrounding : undefined);
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
};