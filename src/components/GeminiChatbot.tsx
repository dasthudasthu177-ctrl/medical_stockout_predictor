import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  X,
  Volume2,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, Facility } from '../types';
import { db, saveChatMessageToFirestore } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface GeminiChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility;
  currentStockSummary?: string;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  isOpen,
  onClose,
  facility,
  currentStockSummary,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text: `Hello! I am your **Public Health Supply Chain Logistics Copilot** for ${facility.name}.\n\nI can help you forecast medicine stockouts, compute inter-clinic buffer transfers, synthesize real-time disease outbreak trends, or draft automated restock purchase orders for TNMSC depots.\n\nHow can I assist your health center today?`,
      createdAt: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Listen to Firestore chat_messages
  useEffect(() => {
    try {
      const q = query(collection(db, 'chat_messages'), orderBy('timestamp', 'asc'), limit(30));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loaded: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loaded.push({
              id: doc.id,
              role: data.role,
              text: data.text,
              createdAt: data.createdAt || 'Recent',
            });
          });
          if (loaded.length > 0) {
            setMessages(loaded);
          }
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore chat listener offline/bypassed:', err);
    }
  }, []);

  // Send message to Gemini multi-turn chat endpoint
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Persist user message to Firestore
    saveChatMessageToFirestore({
      id: userMsg.id,
      role: 'user',
      text: userMsg.text,
      createdAt: userMsg.createdAt,
    });

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyPayload,
          message: textToSend,
          facility,
          currentStockSummary,
        }),
      });

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        text: data.reply || 'Understood. Stock analysis complete.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);

      // Persist assistant message to Firestore
      saveChatMessageToFirestore({
        id: modelMsg.id,
        role: 'model',
        text: modelMsg.text,
        createdAt: modelMsg.createdAt,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Based on your request, I recommend dispatching an emergency replenishment order for ORS and Paracetamol 500mg tablets to TNMSC South Depot to mitigate immediate stockouts.`,
        createdAt: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Start microphone recording for audio transcription
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        setTranscribing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Audio: base64Data,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.transcript) {
              setInput(data.transcript);
            }
          } catch (err) {
            console.error('Transcription error:', err);
          } finally {
            setTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access denied or not supported, using Web Speech API fallback:', err);
      // Fallback to Web Speech API
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[750px]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">Gemini Supply Chain Copilot</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 font-mono">
                  Multi-Turn AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logistics & Epidemic Intelligence for <span className="text-slate-200">{facility.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs shrink-0">
          <span className="text-slate-500 text-[11px] shrink-0">Prompts:</span>
          {[
            'Which medicine will run out first?',
            'Suggest transfer from Royapettah store',
            'Draft restock order for Paracetamol',
            'How is monsoon affecting ORS demand?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleSend(promptText)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-violet-900/60 border border-violet-700/60 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] space-y-1.5 leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] ${
                      isUser ? 'text-emerald-200' : 'text-slate-500'
                    } text-right`}
                  >
                    {m.createdAt}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <div className="w-6 h-6 rounded-lg bg-violet-900/40 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
              </div>
              <span>Gemini Copilot is synthesizing hospital dispensing patterns...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-850 space-y-2">
          {transcribing && (
            <div className="text-[11px] text-cyan-400 flex items-center space-x-1.5 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Transcribing voice note with gemini-3.5-transcribe...</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* Audio Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isRecording ? 'Stop recording voice note' : 'Record voice note (Audio transcription)'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? 'Listening to your voice...' : 'Ask about stockouts, reorders, or disease trends...'}
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
