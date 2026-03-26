import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, MicOff, User, Bot, Loader2, Volume2, Info, AlertTriangle, ArrowLeft, Sparkles, Plus, History } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audio?: string;
  emergency?: boolean;
  explanation?: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, interimTranscript, startListening, stopListening, setTranscript } = useSpeechToText();
  const { playBase64 } = useAudioPlayer();

  const suggestions = [
    "Check my blood sugar levels",
    "Analyze my latest report",
    "I'm feeling dizzy",
    "What's my next medication?",
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isListening) {
      setInput(transcript + interimTranscript);
    }
  }, [transcript, interimTranscript, isListening]);

  const sendMessage = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setTranscript('');
    setIsLoading(true);

    try {
      const systemInstruction = `You are VoiceRx, a healthcare AI assistant. 
      User Profile: ${JSON.stringify(profile || {})}
      
      STRICT RULES:
      1. Responses MUST be based on the user's medical conditions and profile.
      2. Do NOT give generic or random advice.
      3. Tailor every response specifically to the user's health history.
      4. Prioritize conditions like diabetes, BP, heart issues.
      5. If multiple conditions exist, consider all of them together.
      6. If no condition is provided, give general advice.
      7. If a nutrient deficiency is mentioned (Vitamin D, B12, Iron, etc.):
         - Food: [List practical foods]
         - Lifestyle: [List daily habits]
         - End with: "Consult a doctor if symptoms persist."
      
      PERSONALIZATION:
      - Diabetes -> consider blood sugar levels
      - Hypertension/BP -> consider blood pressure risks
      - Elderly -> be more cautious
      - Medications -> avoid conflicting suggestions
      
      BEHAVIOR:
      - Connect symptoms to conditions (e.g., dizzy + diabetic -> check sugar).
      - Response Style: Short (2-3 sentences), simple language, caring tone.
      - Safety: Do NOT diagnose or prescribe. If serious, say "Consult a doctor".
      
      FORMATTING:
      - If emergency keywords detected, start with [EMERGENCY].
      - Always include a section "Why this advice?" at the end explaining the medical reasoning briefly.
      - ALWAYS return the response in two parts separated by a [AUDIO_START] delimiter:
        1. The main text response (with formatting, "Why this advice?", etc.)
        2. An audio-friendly version (same content, simple sentences, no special characters, easy to convert to speech).
        Example: [Main Text] [AUDIO_START] [Audio Friendly Text]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content + (m.explanation ? `\nWhy this advice? ${m.explanation}` : '') }] })),
          { role: 'user', parts: [{ text: messageText }] }
        ],
        config: {
          systemInstruction,
        }
      });

      const fullRawText = response.text || "";
      const [mainContent, audioFriendlyRaw] = fullRawText.split("[AUDIO_START]");
      const audioFriendly = audioFriendlyRaw?.trim() || mainContent?.trim();
      
      const isEmergency = mainContent.includes("[EMERGENCY]");
      const parts = mainContent.split("Why this advice?");
      const reply = parts[0].replace(/\[EMERGENCY\]/g, "").trim();
      const explanation = parts[1] ? parts[1].trim() : null;

      // Get TTS for the audio-friendly version using Gemini's native TTS
      let audio = null;
      try {
        const ttsResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: isEmergency ? `Emergency Alert! ${audioFriendly}` : audioFriendly }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        });
        audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      } catch (ttsErr) {
        console.error("Gemini TTS Error:", ttsErr);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        audio: audio,
        emergency: isEmergency,
        explanation: explanation
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (audio) {
        await playBase64(audio);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
      if (input.trim()) sendMessage();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex items-center gap-4 p-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl relative z-20">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            VoiceRx <span className="text-blue-500">Copilot</span>
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Always Listening</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <History size={20} />
          </button>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10 custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6 shadow-xl shadow-blue-500/10">
              <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">How can I help you today?</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              I'm your AI health copilot. Ask me about your medications, symptoms, or diet based on your profile.
            </p>
            <div className="grid grid-cols-1 gap-3 w-full">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendMessage(s)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-300 text-sm font-bold text-left hover:bg-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between group"
                >
                  {s}
                  <Plus size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn("flex w-full", msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div className={cn("flex gap-4 max-w-[85%] md:max-w-[70%]", msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg",
                  msg.role === 'user' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-slate-900 border-white/10 text-blue-400'
                )}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className="space-y-2">
                  <GlassCard className={cn(
                    "p-5 md:p-6",
                    msg.role === 'user' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-slate-900/50 border-white/10',
                    msg.emergency && 'border-red-500/50 bg-red-500/10 ring-2 ring-red-500/20'
                  )}>
                    {msg.emergency && (
                      <div className="flex items-center gap-2 text-red-400 font-black text-xs mb-3 uppercase tracking-[0.2em]">
                        <AlertTriangle size={16} className="animate-pulse" />
                        Emergency Alert
                      </div>
                    )}
                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap text-base md:text-lg font-medium">{msg.content}</p>
                    
                    {msg.explanation && (
                      <div className="mt-6 pt-6 border-t border-white/5">
                        <button 
                          onClick={() => setShowExplanation(showExplanation === i ? null : i)}
                          className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-blue-300 transition-colors"
                        >
                          <Info size={14} />
                          Medical Reasoning
                        </button>
                        <AnimatePresence>
                          {showExplanation === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                <p className="text-sm text-gray-400 italic leading-relaxed">
                                  {msg.explanation}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </GlassCard>
                  
                  <div className={cn(
                    "flex items-center gap-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <span>{msg.timestamp}</span>
                    {msg.audio && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => playBase64(msg.audio!)}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <Volume2 size={14} />
                        Replay
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400">
                <Bot size={20} />
              </div>
              <GlassCard className="p-5 flex items-center gap-4 bg-slate-900/50 border-white/10">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400 font-black uppercase tracking-widest">VoiceRx is thinking</span>
              </GlassCard>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} className="h-32" />
      </div>

      {/* Input Area */}
      <div className="p-6 md:p-10 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-4">
            <div className="flex-1 relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask VoiceRx anything..."}
                rows={1}
                className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-8 py-5 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none pr-16 shadow-2xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={toggleVoice}
                className={cn(
                  "absolute right-4 bottom-4 p-3 rounded-2xl transition-all shadow-lg",
                  isListening 
                    ? 'bg-red-500 text-white shadow-red-500/20' 
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                )}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </motion.button>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="p-5 bg-blue-600 text-white rounded-[2rem] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-blue-600/30"
            >
              <Send size={28} />
            </motion.button>
          </div>
          
          <AnimatePresence>
            {isListening && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 flex flex-col items-center justify-center gap-4"
              >
                <div className="flex items-center gap-1.5 h-12">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        height: [10, Math.random() * 40 + 10, 10],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.5 + Math.random() * 0.5,
                        delay: i * 0.05 
                      }}
                      className="w-1 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                  Voice Input Active
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}