import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Activity, Heart, ShieldAlert, MapPin, TrendingUp, Calendar, Pill, Utensils, ArrowRight, Bell, Zap, Brain, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});
export function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [meds, setMeds] = useState<any[]>([]);
  const [nearbyCare, setNearbyCare] = useState<any>(null);
  const [healthScore, setHealthScore] = useState(82);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    fetchNearbyCare();
    // Simulate health score calculation
    const timer = setTimeout(() => setHealthScore(88), 1500);
    return () => clearTimeout(timer);
  }, []);

  const fetchNearbyCare = async () => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `What is the closest emergency hospital to latitude ${latitude}, longitude ${longitude}? Provide the name, distance, and status in JSON format: { "name": "...", "distance": "...", "status": "..." }`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: latitude,
                  longitude: longitude
                }
              }
            }
          }
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{.*\}/s);
        const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { name: "City General Hospital", distance: "1.2 miles away", status: "Open 24/7", wait: "15 min wait" };
        setNearbyCare(data);
      } catch (err) {
        console.error("Failed to fetch nearby care", err);
      }
    });
  };

  const fetchData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/medications', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (pRes.ok) setProfile(await pRes.json());
      if (mRes.ok) setMeds(await mRes.json());
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  const adherence = meds.length > 0 ? 85 : 0;

  const stats = [
    { label: 'Adherence', value: `${adherence}%`, icon: <Activity className="text-emerald-400" />, color: 'emerald' },
    { label: 'Stress', value: 'Normal', icon: <Brain className="text-blue-400" />, color: 'blue' },
    { label: 'Sleep', value: '7.2h', icon: <Zap className="text-purple-400" />, color: 'purple' },
    { label: 'Hydration', value: '1.8L', icon: <Droplets className="text-sky-400" />, color: 'sky' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-40 pt-8 px-6 max-w-5xl mx-auto overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between mb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
            Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">{profile?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Your health is our priority today.
          </p>
        </motion.div>
        <div className="flex gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all relative group"
          >
            <Bell size={22} />
            <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-slate-950 group-hover:scale-125 transition-transform" />
          </motion.button>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/profile')}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-black cursor-pointer shadow-lg shadow-blue-500/20"
          >
            {profile?.name?.[0] || 'U'}
          </motion.div>
        </div>
      </header>

      {/* Health Score Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <GlassCard className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-white/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-colors" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * healthScore) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-blue-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white">{healthScore}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-white mb-2">Overall Health Status: <span className="text-emerald-400">Excellent</span></h2>
              <p className="text-gray-400 font-medium mb-6 max-w-md">
                You're performing better than 88% of users in your demographic. Your consistency with medications and hydration is driving this progress.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
                  Detailed Report
                </button>
                <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all">
                  Share with Doctor
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-6 flex flex-col items-center text-center group hover:border-blue-500/30 transition-all cursor-default">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-3xl font-black text-white mb-1">{stat.value}</span>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Emergency Triage */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <GlassCard 
          onClick={() => navigate('/chat')}
          className="p-8 bg-red-500/5 border-red-500/20 hover:bg-red-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] -mr-16 -mt-16 animate-pulse" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shadow-lg shadow-red-500/10">
              <ShieldAlert size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-red-400 mb-2">Emergency Triage</h3>
              <p className="text-red-200/60 font-medium max-w-xl">Feeling severe symptoms? Speak to VoiceRx now for immediate AI-driven triage and guidance.</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 group-hover:translate-x-2 transition-transform">
              <ArrowRight size={24} />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Daily Schedule */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Calendar className="text-blue-500" size={24} />
              Daily Schedule
            </h2>
            <button className="text-blue-500 text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {meds.length > 0 ? meds.slice(0, 3).map((med, i) => (
              <GlassCard key={i} className="p-5 flex items-center gap-5 hover:border-white/20 transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Pill size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-black text-lg">{med.name}</p>
                  <p className="text-gray-500 font-medium">{med.dosage} • {med.frequency}</p>
                </div>
                <div className="text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-xl">
                  {med.times?.split(',')[0] || '8:00 AM'}
                </div>
              </GlassCard>
            )) : (
              <GlassCard className="p-12 text-center border-dashed border-white/10">
                <p className="text-gray-500 font-medium italic">No medications scheduled for today.</p>
              </GlassCard>
            )}
            <GlassCard className="p-5 flex items-center gap-5 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Utensils size={24} />
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-lg">Healthy Lunch</p>
                <p className="text-gray-500 font-medium">Quinoa Salad with Grilled Chicken</p>
              </div>
              <div className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
                12:30 PM
              </div>
            </GlassCard>
          </div>
        </section>

        {/* AI Health Insights */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <TrendingUp className="text-purple-500" size={24} />
              AI Insights
            </h2>
          </div>
          <div className="space-y-6">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassCard className="p-6 border-l-4 border-l-blue-500 bg-blue-500/5 relative group">
                  <div className="absolute top-4 right-4 text-blue-500/30 group-hover:text-blue-500 transition-colors">
                    <Zap size={20} />
                  </div>
                  <p className="text-gray-300 font-medium leading-relaxed italic pr-8">
                    "Your activity levels are up by 15% this week. This correlates with improved sleep quality. Keep it up, {profile?.name?.split(' ')[0] || 'User'}!"
                  </p>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <GlassCard className="p-6 border-l-4 border-l-yellow-500 bg-yellow-500/5 relative group">
                  <div className="absolute top-4 right-4 text-yellow-500/30 group-hover:text-yellow-500 transition-colors">
                    <ShieldAlert size={20} />
                  </div>
                  <p className="text-gray-300 font-medium leading-relaxed italic pr-8">
                    "You missed your evening dose of Metformin twice. Consistency is key for managing your blood sugar levels effectively."
                  </p>
                </GlassCard>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <GlassCard className="p-6 border-l-4 border-l-emerald-500 bg-emerald-500/5 relative group">
                  <div className="absolute top-4 right-4 text-emerald-500/30 group-hover:text-emerald-500 transition-colors">
                    <Heart size={20} />
                  </div>
                  <p className="text-gray-300 font-medium leading-relaxed italic pr-8">
                    "Based on your recent diet logs, you're meeting your protein goals 6/7 days. Great progress!"
                  </p>
                </GlassCard>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* Nearby Care */}
      <section className="mt-16">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <MapPin className="text-red-500" size={24} />
          Nearby Emergency Care
        </h2>
        <GlassCard className="p-8 flex flex-col md:flex-row items-center gap-8 hover:border-white/20 transition-all group">
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-colors shadow-lg shadow-red-500/5">
            <MapPin size={36} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-2xl font-black text-white mb-2">{nearbyCare?.name || 'City General Hospital'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-white/5 rounded-lg text-gray-400 text-xs font-black uppercase tracking-widest">{nearbyCare?.distance || '1.2 miles away'}</span>
              <span className="px-3 py-1 bg-emerald-500/10 rounded-lg text-emerald-400 text-xs font-black uppercase tracking-widest">{nearbyCare?.status || 'Open 24/7'}</span>
              <span className="px-3 py-1 bg-blue-500/10 rounded-lg text-blue-400 text-xs font-black uppercase tracking-widest">{nearbyCare?.wait || '15 min wait'}</span>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nearbyCare?.name || 'Hospital')}`)}
            className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30"
          >
            Navigate Now
          </motion.button>
        </GlassCard>
      </section>
    </div>
  );
}
