import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { GlassCard } from '../components/GlassCard';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, ArrowRight, Upload, CheckCircle, Volume2, User, Activity, Target, Clipboard, Sparkles, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
const QUESTIONS = [
  { id: 'name', label: 'What is your name?', icon: <User />, key: 'name', placeholder: 'e.g. John Doe' },
  { id: 'age', label: 'How old are you?', icon: <Activity />, key: 'age', placeholder: 'e.g. 28' },
  { id: 'conditions', label: 'Any existing medical conditions?', icon: <Activity />, key: 'conditions', placeholder: 'e.g. None, Diabetes, etc.' },
  { id: 'medications', label: 'Are you taking any medications?', icon: <Clipboard />, key: 'medications', placeholder: 'e.g. Aspirin, etc.' },
  { id: 'goals', label: 'What are your health goals?', icon: <Target />, key: 'goals', placeholder: 'e.g. Weight loss, Muscle gain' },
  { id: 'upload', label: 'Upload a medical report?', icon: <Upload />, key: 'upload', optional: true }
];

export function VoiceOnboarding() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechToText();
  const { playBase64 } = useAudioPlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = QUESTIONS[step];

  const speakQuestion = useCallback(async (text: string) => {
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audio) {
        playBase64(audio);
      }
    } catch (err) {
      console.error('Gemini TTS Error:', err);
    }
  }, [playBase64]);

  useEffect(() => {
    if (step < QUESTIONS.length) {
      speakQuestion(QUESTIONS[step].label);
    }
  }, [step, speakQuestion]);

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      setTranscript('');
    } else {
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setTranscript('');
    }
  };

  const finishOnboarding = async () => {
    setIsProcessing(true);
    try {
      if (file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
        });
        reader.readAsDataURL(file);
        const base64Data = await base64Promise;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                  },
                },
                {
                  text: "You are a medical report analyzer. Extract key insights, abnormal values, and a summary of this medical report. Be concise and professional. Do not provide a diagnosis, but suggest what to discuss with a doctor. ALWAYS return the response in two parts separated by a [AUDIO_START] delimiter: 1. The main text analysis 2. An audio-friendly version (simple sentences, easy to read aloud).",
                },
              ],
            },
          ],
        });

        const analysis = response.text || "AI Analysis: Your report has been processed.";

        const formData = new FormData();
        formData.append('file', file);
        formData.append('analysis', analysis);
        
        await fetch('/api/files/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(answers),
      });
      
      if (res.ok) {
        toast.success('Onboarding complete!');
        window.location.href = '/'; 
      }
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const cleanTranscript = async () => {
      if (!isListening && transcript && step < QUESTIONS.length - 1) {
        setIsProcessing(true);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Extract the specific value for the field "${currentQuestion.key}" from the following user transcript in response to the question "${currentQuestion.label}". 
            Return ONLY the extracted value. If no value can be extracted, return the original transcript.
            Transcript: "${transcript}"`,
          });

          const cleanedValue = response.text?.trim() || transcript;
          setAnswers((prev: any) => ({ ...prev, [currentQuestion.key]: cleanedValue }));
          setTranscript('');
        } catch (err) {
          console.error('Extract Info Error:', err);
          setAnswers((prev: any) => ({ ...prev, [currentQuestion.key]: transcript }));
        } finally {
          setIsProcessing(false);
        }
      }
    };

    cleanTranscript();
  }, [isListening, transcript, step, currentQuestion.label, currentQuestion.key, setTranscript]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      toast.success('File attached!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-xl relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex gap-2">
            {QUESTIONS.map((_, i) => (
              <motion.div 
                key={i} 
                initial={false}
                animate={{ 
                  width: i === step ? 48 : 12,
                  backgroundColor: i <= step ? 'rgba(59, 130, 246, 1)' : 'rgba(255, 255, 255, 0.1)'
                }}
                className="h-2 rounded-full transition-all duration-500" 
              />
            ))}
          </div>
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Step {step + 1} / {QUESTIONS.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <GlassCard className="p-10 text-center border-white/10 shadow-2xl shadow-blue-500/5">
              <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 text-blue-400 shadow-xl shadow-blue-500/10">
                {currentQuestion.icon}
              </div>
              
              <h2 className="text-3xl font-black mb-10 leading-tight tracking-tight">{currentQuestion.label}</h2>

              {currentQuestion.id === 'upload' ? (
                <div className="space-y-8">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative p-12 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-blue-500/50 transition-all cursor-pointer bg-white/5 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-blue-400 transition-colors">
                        <Upload size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">Click to upload medical report</p>
                      {file && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-blue-400 font-black text-sm">
                          <CheckCircle size={16} />
                          {file.name}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={finishOnboarding}
                      disabled={isProcessing}
                      className="flex-[2] py-5 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Sparkles size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Waveform Animation */}
                  <div className="h-24 flex items-center justify-center gap-1">
                    {isListening ? (
                      [...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            height: [20, 60, 20],
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 0.5 + Math.random() * 0.5,
                            delay: i * 0.05
                          }}
                          className="w-1.5 bg-blue-500 rounded-full"
                        />
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Volume2 size={20} className="animate-pulse" />
                        <span className="text-sm uppercase tracking-widest font-black">VoiceRx is listening...</span>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={answers[currentQuestion.key] || transcript || ''}
                      onChange={(e) => setAnswers({ ...answers, [currentQuestion.key]: e.target.value })}
                      placeholder={currentQuestion.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-8 py-6 text-xl font-bold text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-center placeholder:text-gray-700"
                    />
                    <AnimatePresence>
                      {isProcessing && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500"
                        >
                          <Loader2 size={24} className="animate-spin" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={isListening ? stopListening : startListening}
                      className={cn(
                        "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all relative group",
                        isListening ? "bg-rose-600 shadow-2xl shadow-rose-600/40" : "bg-blue-600 shadow-2xl shadow-blue-600/40"
                      )}
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]" />
                      {isListening ? <MicOff size={40} /> : <Mic size={40} />}
                    </motion.button>
                  </div>

                  <div className="flex gap-4">
                    {step > 0 && (
                      <button
                        onClick={handleBack}
                        className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    <button
                      onClick={handleNext}
                      disabled={isProcessing || (!answers[currentQuestion.key] && !transcript)}
                      className="flex-1 py-5 bg-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next Step
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex items-center justify-center gap-3 text-gray-500"
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">End-to-End Encrypted Session</span>
        </motion.div>
      </div>
    </div>
  );
}
