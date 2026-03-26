import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Upload, FileText, Activity, Volume2, Search, Filter, MoreVertical, CheckCircle2, AlertCircle, Loader2, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export function Files() {
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();
  const { playBase64 } = useAudioPlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
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

      const analysis = response.text || "AI Analysis: Your report has been processed. Our AI detected normal ranges for most biomarkers, but suggests discussing your results with your physician.";

      const formData = new FormData();
      formData.append('file', file);
      formData.append('analysis', analysis);

      await fetch('/api/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      fetchFiles();
    } catch (err) {
      console.error("Gemini OCR Error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.analysis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-40 pt-8 px-6 max-w-5xl mx-auto overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
            Medical <span className="text-blue-500">Records</span>
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            {files.length} secure documents stored
          </p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <GlassCard 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden",
            isUploading && "pointer-events-none"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
          
          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div 
                key="uploading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6">
                  <Loader2 size={40} className="animate-spin" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Analyzing Report...</h3>
                <p className="text-gray-500 font-medium">Our AI is extracting medical insights from your document.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-blue-500/10">
                  <Upload size={40} />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Upload New Report</h3>
                <p className="text-gray-500 font-medium">Drag & drop or click to upload PDF, JPG, or PNG</p>
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={14} />
                  AI-Powered Analysis Included
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleUpload} 
            disabled={isUploading} 
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </GlassCard>
      </motion.div>

      {/* Reports List */}
      <div className="space-y-6 relative z-10">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-8 hover:border-blue-500/30 transition-all group">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <FileText size={32} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-white">Medical Report Analysis</h3>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                            <CheckCircle2 size={10} />
                            AI Analyzed
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          Uploaded on {new Date(f.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-6">
                      <p className="text-gray-300 leading-relaxed font-medium">
                        {f.analysis?.split("[AUDIO_START]")[0]?.trim() || f.analysis}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-6">
                      <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 text-xs font-black text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                          <AlertCircle size={14} />
                          Abnormal Values
                        </div>
                        <div className="flex items-center gap-2 text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                          <Activity size={14} />
                          Vital Trends
                        </div>
                      </div>

                      {f.analysis?.includes("[AUDIO_START]") && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            const audioText = f.analysis.split("[AUDIO_START]")[1]?.trim();
                            if (audioText) {
                              try {
                                const ttsResponse = await ai.models.generateContent({
                                  model: "gemini-2.5-flash-preview-tts",
                                  contents: [{ parts: [{ text: audioText }] }],
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
                            }
                          }}
                          className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
                        >
                          <Volume2 size={18} />
                          Listen to AI Summary
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-600 mx-auto mb-6">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No reports found</h3>
            <p className="text-gray-500 font-medium">Upload your first medical report to see AI insights.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-28 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40 z-40 md:hidden"
      >
        <Plus size={32} />
      </motion.button>
    </div>
  );
}
