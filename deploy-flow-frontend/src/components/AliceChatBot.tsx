import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Bot, User, GitBranch, Server, Mic, Square } from 'lucide-react'; // Added Mic, Square
import { startChat, sendMessage } from '@/services/gemini';
import { useSettings } from '@/contexts/SettingsContext';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface AliceChatBotProps {
  onDeploy: (branch: string, environment: string) => void;
}

const AVAILABLE_ENVIRONMENTS = [
  ...Array.from({ length: 14 }, (_, i) => `staging-${i + 1}`),
  'ubt'
];

const INITIAL_PROMPT = `Hi there! I'm Alice, your deployment assistant! 👋

I can help you deploy code to our staging environments. You can:
• Deploy a branch to a staging environment
• Ask about available branches
• Ask about staging environments

What would you like to do?`;

const AliceChatBot: React.FC<AliceChatBotProps> = ({ onDeploy }) => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: INITIAL_PROMPT,
      isUser: false,
      timestamp: new Date(),
      suggestions: ['Show available branches', 'Show staging environments', 'Help me deploy']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [autoListenAfterAliceSpeaks, setAutoListenAfterAliceSpeaks] = useState(false);

  // Speech Recognition (STT)
  const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null); // Using any for SpeechRecognition type for broader compatibility
  const hasSpokenInitialGreetingRef = useRef(false); // To ensure initial greeting is spoken only once per open

  // Effect for STT setup and cleanup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API is not supported in this browser.");
      // Optionally, disable microphone button or show a message to the user
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Process speech after a pause
    recognition.interimResults = true; // Get interim results as user speaks
    recognition.lang = 'en-US'; // Set language

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update input text with interim or final results
      // Prioritize final transcript but show interim for responsiveness
      setInputText(finalTranscript || interimTranscript);
      if (finalTranscript) {
        // Automatically send the message when a final transcript is received
        // Ensure inputText is updated before calling handleSendMessage if it relies on state
        // A direct call might be better if handleSendMessage can take the text directly.
        // For now, let's assume handleSendMessage will pick up the updated inputText.
        // We'll call a dedicated function to handle this to ensure state updates.
        handleSpokenMessage(finalTranscript);
        if (recognitionRef.current) {
          recognitionRef.current.stop(); // Stop listening, onend will set isListening to false
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'no-speech' || event.error === 'audio-capture' || event.error === 'not-allowed') {
        // Handle specific errors like no speech, mic issues, or permission denied
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Empty dependency array, set up once

  const handleToggleListen = useCallback(() => {
    if (!recognitionRef.current) {
      console.warn("Speech Recognition not available.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setAutoListenAfterAliceSpeaks(false); // User manually stopped listening
    } else {
      try {
        setInputText(''); // Clear input text before starting to listen
        recognitionRef.current.start();
        setIsListening(true);
        setAutoListenAfterAliceSpeaks(true); // User initiated listening with voice
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false); // Ensure listening state is reset on error
      }
    }
  }, [isListening, setInputText]); // Added setInputText to dependencies

  // Text-to-Speech (TTS) function
  const speakText = useCallback((text: string) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech before speaking a new message
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize voice, rate, pitch etc. here if desired
    utterance.onend = () => {
      if (autoListenAfterAliceSpeaks && recognitionRef.current && !isListening) {
        try {
          setInputText(''); // Clear input for new speech
          recognitionRef.current.start();
          setIsListening(true); // Update listening state
        } catch (error) {
          console.error("Error auto-starting speech recognition:", error);
          setIsListening(false);
          setAutoListenAfterAliceSpeaks(false); // Disable auto-listen on error
        }
      }
    };
    // utterance.voice = voices.find(voice => voice.name === 'Google UK English Female') || voices[0];
    // utterance.pitch = 1;
    // utterance.rate = 1;
    synthRef.current.speak(utterance);
  }, [autoListenAfterAliceSpeaks, isListening, setInputText]); // Added dependencies

  // Initialize SpeechSynthesis reference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    } else {
      console.warn("Speech Synthesis API is not supported in this browser.");
    }
    // Clean up: cancel any speech if the component unmounts
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Branch fetching
  const [branches, setBranches] = useState<string[]>([]); // Restored this line
  const [branchesLoading, setBranchesLoading] = useState(false); // Restored this line
  const [branchesError, setBranchesError] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true);
      setBranchesError('');
      try {
        const res = await fetch(
          `http://localhost:3000/branches/branches?owner=gaulomail&repo=mukuru`
        );
        const data = await res.json();
        if (data.branches) {
          setBranches(data.branches);
        } else {
          setBranches([]);
          setBranchesError('No branches found');
        }
      } catch (err) {
        setBranchesError('Failed to fetch branches');
        setBranches([]);
      } finally {
        setBranchesLoading(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const initChat = async () => {
      try {
        console.log('Initializing chat...');
        const session = await startChat();
        console.log('Chat session created successfully');
        setChatSession(session);
      } catch (error) {
        console.error('Error initializing chat:', error);
        addMessage(`Error initializing chat: ${error.message}`, false);
      }
    };
    initChat();

    // Speak initial prompt when chat opens for the first time in a session
    if (isOpen && !hasSpokenInitialGreetingRef.current) {
      speakText(INITIAL_PROMPT);
      hasSpokenInitialGreetingRef.current = true;
    }
    // Reset when chat is closed so it speaks again next time it opens
    if (!isOpen) {
      hasSpokenInitialGreetingRef.current = false;
    }

  }, [isOpen]); // Added isOpen to dependencies

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, isUser: boolean, suggestions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);

    if (!isUser) {
      speakText(text); // Speak Alice's messages
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setAutoListenAfterAliceSpeaks(false); // User clicked a suggestion
    addMessage(suggestion, true);
    setIsTyping(true);

    let response = '';
    let nextSuggestions: string[] = [];

    // Handle branch selection
    if (branches.includes(suggestion)) {
      setSelectedBranch(suggestion);
      response = `Great! You've selected the branch '${suggestion}'. Now, which environment should we deploy to?`;
      nextSuggestions = AVAILABLE_ENVIRONMENTS;
    }
    // Handle environment selection
    else if (AVAILABLE_ENVIRONMENTS.includes(suggestion) && selectedBranch) {
      setSelectedEnvironment(suggestion);
      response = `Perfect! I'm setting up the deployment of '${selectedBranch}' to '${suggestion}'. Click the Deploy button when you're ready! 🚀`;
      nextSuggestions = ['Start new deployment'];
      onDeploy(selectedBranch, suggestion);
      // Reset selections after deployment is set up
      setSelectedBranch(null);
      setSelectedEnvironment(null);
    }
    // Handle command suggestions
    else {
      switch (suggestion.toLowerCase()) {
        case 'show available branches':
          if (branchesLoading) {
            response = 'Loading branches...';
            nextSuggestions = [];
          } else if (branchesError) {
            response = branchesError;
            nextSuggestions = ['Show available branches', 'Show staging environments'];
          } else {
            response = `Here are the available branches:\n\n${branches.map(branch => `• ${branch}`).join('\n')}`;
            nextSuggestions = [...branches, 'Show staging environments'];
          }
          break;
        case 'show staging environments':
          response = `Here are the available environments:\n\n${AVAILABLE_ENVIRONMENTS.map(env => `• ${env}`).join('\n')}`;
          nextSuggestions = ['Help me deploy', 'Show available branches'];
          break;
        case 'help me deploy':
          response = "Let's start the deployment process! Which branch would you like to deploy?";
          nextSuggestions = branches;
          break;
        case 'start new deployment':
          response = "Let's start a new deployment! Which branch would you like to deploy?";
          nextSuggestions = branches;
          setSelectedBranch(null);
          setSelectedEnvironment(null);
          break;
        default:
          response = "I'm not sure what you'd like to do. Would you like to see the available branches or environments?";
          nextSuggestions = ['Show available branches', 'Show staging environments', 'Help me deploy'];
      }
    }

    setTimeout(() => {
      addMessage(response, false, nextSuggestions);
      setIsTyping(false);
    }, 500);
  };

  // Function to handle sending message from speech input
  const handleSpokenMessage = async (spokenText: string) => {
    if (!spokenText.trim() || !chatSession) return;

    // setAutoListenAfterAliceSpeaks is already true if we got here via voice
    addMessage(spokenText, true);
    setInputText(''); // Clear the input field
    setIsTyping(true);

    try {
      const contextMessage = `You are Alice, a deployment assistant. You can only help with deployments and must stay focused on that. \nCurrent state: ${selectedBranch ? `Selected branch: ${selectedBranch}` : 'No branch selected'}\n${selectedEnvironment ? `Selected environment: ${selectedEnvironment}` : 'No environment selected'}\nAvailable branches: ${branches.join(', ')}\nAvailable environments: ${AVAILABLE_ENVIRONMENTS.join(', ')}\n\nUser message: ${spokenText}\n\nRespond naturally but keep the focus on deployments. If they ask about anything not related to deployments, branches, or environments, politely redirect them to deployment-related topics.`;
      const response = await sendMessage(chatSession, contextMessage);
      let suggestions = ['Show available branches', 'Show staging environments', 'Help me deploy'];
      if (selectedBranch && !selectedEnvironment) {
        suggestions = AVAILABLE_ENVIRONMENTS;
      } else if (!selectedBranch) {
        suggestions = [...suggestions, ...branches];
      }
      addMessage(response, false, suggestions);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = (error as Error).message || "Unknown error occurred";
      addMessage(`I apologize, but I encountered an error: ${errorMessage}. Please try again.`, false, 
        ['Show available branches', 'Show staging environments', 'Help me deploy']);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    setAutoListenAfterAliceSpeaks(false); // User sent message by typing/pressing enter
    const userMessage = inputText.trim();
    // Call the same logic as handleSpokenMessage for consistency, or refactor to a common function
    // For now, let's keep it separate to clearly distinguish typed vs spoken triggers if needed later
    // but essentially it will do the same as handleSpokenMessage with inputText
    addMessage(userMessage, true);
    setInputText('');
    setIsTyping(true);

    try {
      // Get response from Gemini with context about deployment
      const contextMessage = `You are Alice, a deployment assistant. You can only help with deployments and must stay focused on that. \nCurrent state: ${selectedBranch ? `Selected branch: ${selectedBranch}` : 'No branch selected'}\n${selectedEnvironment ? `Selected environment: ${selectedEnvironment}` : 'No environment selected'}\nAvailable branches: ${branches.join(', ')}\nAvailable environments: ${AVAILABLE_ENVIRONMENTS.join(', ')}\n\nUser message: ${userMessage}\n\nRespond naturally but keep the focus on deployments. If they ask about anything not related to deployments, branches, or environments, politely redirect them to deployment-related topics.`;

      const response = await sendMessage(chatSession, contextMessage);
      let suggestions = ['Show available branches', 'Show staging environments', 'Help me deploy'];
      
      // If we're in the middle of a deployment flow, show relevant suggestions
      if (selectedBranch && !selectedEnvironment) {
        suggestions = AVAILABLE_ENVIRONMENTS;
      } else if (!selectedBranch) {
        suggestions = [...suggestions, ...branches];
      }
      
      addMessage(response, false, suggestions);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorMessage = error.message || "Unknown error occurred";
      addMessage(`I apologize, but I encountered an error: ${errorMessage}. Please try again.`, false, 
        ['Show available branches', 'Show staging environments', 'Help me deploy']);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-50"
        >
          <MessageCircle className="h-8 w-8 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[32rem] shadow-2xl border-0 themed-component backdrop-blur-sm z-50 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 bg-primary text-primary-foreground rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/mukuru-logo.png" 
                  alt="Mukuru" 
                  className="h-8 object-contain brightness-0 invert"
                />
                <div>
                  <CardTitle className="text-lg">Alice</CardTitle>
                  <p className="text-sm text-white/80">Your AI Deployment Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/50">
              {messages.map((message) => (
                <div key={message.id} className="space-y-4">
                  <div className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isUser && (
                      <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-muted text-muted-foreground rounded-br-none'
                          : 'bg-muted text-muted-foreground rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs mt-1 text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.isUser && (
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-11">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {branches.includes(suggestion) ? (
                            <GitBranch className="h-3 w-3 mr-1" />
                          ) : AVAILABLE_ENVIRONMENTS.includes(suggestion) ? (
                            <Server className="h-3 w-3 mr-1" />
                          ) : null}
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted text-muted-foreground p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-card rounded-b-lg flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about deployments..."
                  className="flex-1 themed-input"
                />
                <Button
                  onClick={handleToggleListen} // Call handleToggleListen
                  variant="outline" // Style appropriately
                  size="icon" // Make it an icon button
                  className="border-border hover:bg-muted/80"
                  title={isListening ? "Stop listening" : "Start listening"}
                >
                  {isListening ? <Square className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || !chatSession || isListening}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Try: "Show me available branches"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export { AliceChatBot };
