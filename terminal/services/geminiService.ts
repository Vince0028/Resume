import { GoogleGenAI, Chat } from "@google/genai";
import { RESUME_DATA } from '../constants';

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are the Operating System (OS) for Alex 'Cipher' Dev's portfolio terminal.
Your persona is a helpful, slightly robotic, but highly intelligent mainframe system from a cyberpunk future.
You answer questions about Alex based on the RESUME_DATA provided below.
If the user asks something outside the scope of Alex's professional life, politely decline in a "Access Denied" or "Data Unavailable" style, but remain helpful if possible.
Keep responses concise, formatted as terminal output (e.g., lists, short paragraphs).
Do not use Markdown formatting like bold or headers if possible, stick to plain text visual formatting suitable for a raw terminal.
Use <br/> for line breaks if absolutely necessary, but prefer newlines.

RESUME_DATA:
${RESUME_DATA}
`;

export const initializeChat = async () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key missing");
    return null;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return chatSession;
  } catch (error) {
    console.error("Failed to init Gemini", error);
    return null;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }

  if (!chatSession) {
    return "SYSTEM ERROR: NEURAL LINK OFFLINE. (API Key missing or invalid)";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "NO DATA RECEIVED.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "SYSTEM ERROR: CONNECTION INTERRUPTED.";
  }
};