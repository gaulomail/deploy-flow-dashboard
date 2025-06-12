import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('API Key available:', !!API_KEY);

const MODEL_NAME = 'gemini-1.5-pro'; // Updated model

let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('Gemini AI initialized successfully');
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
}

export interface ChatHistory {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const startChat = async () => {
  try {
    console.log('Starting new chat session...');
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log('Model initialized:', MODEL_NAME);
    
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are Alice, a friendly and helpful deployment assistant. You help users deploy code and manage their deployments. Please introduce yourself.' }],
        },
        {
          role: 'model',
          parts: [{ text: "Hi there! I'm Alice, your friendly deployment assistant! 👋 I can help you deploy your code with simple commands like 'Deploy feature-auth to staging-3' or answer any questions you have. How can I help you today?" }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });
    console.log('Chat session started successfully');
    return chat;
  } catch (error) {
    console.error('Error starting chat:', error);
    throw error;
  }
};

export const sendMessage = async (chat: any, message: string) => {
  try {
    console.log('Sending message:', message);
    const result = await chat.sendMessage([{ text: message }]);
    const response = await result.response;
    console.log('Received response:', response.text());
    return response.text();
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};