/// <reference types="vite/client" />

declare global {
  interface Window {
    SpeechRecognition?: any; // Optional to reflect it might not be there
    webkitSpeechRecognition?: any; // Optional for the same reason
  }
}
