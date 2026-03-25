import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { GlassCard } from '../components/GlassCard';
import { 
  Mic, Activity, Shield, Heart, ArrowRight, Play, CheckCircle, 
  Zap, Brain, Apple, Users, Code, Globe, Rocket, Sparkles, 
  Lock, MessageSquare, FileText, ChevronRight, Menu, X,
  Stethoscope, ClipboardList, Clock, AlertCircle
} from 'lucide-react';

function Waveform() {
  return (
    <div className="flex items-center gap-1.5 h-16">
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-600 to-purple-500 rounded-full"
          animate={{
            height: [10, 60, 20, 50, 15, 40, 10],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.05,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Safety', href: '#safety' },
    { name: 'Roadmap', href: '#roadmap' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-slate-950/80 backdrop-blur-xl py-4 border-b border-white/5 shadow-2xl' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3 font-black text-white text-2xl cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-sm shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">V</div>
          <span className="tracking-tighter">VoiceRx</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white text-black rounded-2xl font-black text-sm hover:bg-gray-200 transition-all shadow-xl shadow-white/10"
          >
            Get Started
          </button>
        </div>

        <button className="md:hidden text-white p-2 bg-white/5 rounded-xl" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-6 py-12 flex flex-col gap-8 text-center">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => navigate('/login')}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/20"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.98]);

  const features = [
    {
      icon: <Mic className="text-blue-400" />,
      title: "Voice-First Intelligence",
      description: "Natural language processing optimized for medical context. Talk to your health copilot as if it were a human assistant.",
      tag: "Core"
    },
    {
      icon: <Brain className="text-purple-400" />,
      title: "Medical OCR Engine",
      description: "Upload complex medical reports. Our AI extracts biomarkers, explains results, and tracks trends over time.",
      tag: "Advanced"
    },
    {
      icon: <Shield className="text-emerald-400" />,
      title: "HIPAA-Grade Security",
      description: "End-to-end encryption for all health data. Your privacy is our foundational principle, not an afterthought.",
      tag: "Secure"
    }
  ];

  const roadmap = [
    { phase: "Phase 1", title: "Core Intelligence", items: ["Voice Onboarding", "Medical OCR", "Medication Tracking"], status: "Completed" },
    { phase: "Phase 2", title: "Personalization", items: ["AI Diet Engine", "Symptom Journaling", "Wearable Integration"], status: "In Progress" },
    { phase: "Phase 3", title: "Ecosystem", items: ["Family Health Sharing", "Doctor Portal", "Predictive Analytics"], status: "Upcoming" },
  ];

  const targetUsers = [
    { name: "Seniors", desc: "Voice-first interface removes the complexity of traditional apps.", icon: <Users /> },
    { name: "Chronic Care", desc: "Manage multiple medications and track biomarkers effortlessly.", icon: <Activity /> },
    { name: "Busy Pros", desc: "Quick health summaries and diet planning for high-performance lives.", icon: <Zap /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 scroll-smooth overflow-x-hidden">
      <Navbar />

      {/* Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-6 pt-52 pb-40 text-center">
        <motion.div style={{ opacity, scale }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-10 uppercase tracking-[0.3em]">
              <Sparkles size={14} />
              <span>The Future of Health Intelligence</span>
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black mb-10 tracking-tighter leading-[0.8] uppercase">
              HEALTH, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-emerald-400">
                SIMPLIFIED.
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 mb-16 leading-relaxed font-medium">
              VoiceRx is the world's first voice-native AI health copilot. We turn complex medical data into simple, spoken guidance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-24">
              <button
                onClick={() => navigate('/login')}
                className="group px-12 py-6 bg-blue-600 rounded-3xl font-black text-2xl hover:bg-blue-500 transition-all flex items-center gap-4 shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95"
              >
                Start Free Trial
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-2xl hover:bg-white/10 transition-all flex items-center gap-4 group hover:scale-105 active:scale-95">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play size={20} fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <p className="text-gray-500 text-sm font-black uppercase tracking-[0.4em]">Always Listening</p>
              <Waveform />
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* Problem → Solution Section */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase">
              Healthcare is <br />
              <span className="text-red-500">Friction-Heavy.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertCircle className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Complex Reports</h4>
                  <p className="text-gray-500">Medical results are written for doctors, not for you. Understanding your own data is a struggle.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20">
                  <Clock className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Manual Tracking</h4>
                  <p className="text-gray-500">Logging meds, symptoms, and diet in spreadsheets is tedious and prone to error.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tighter uppercase">
              VoiceRx is <br />
              <span className="text-emerald-500">Frictionless.</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Instant Clarity</h4>
                  <p className="text-gray-500">Upload a report and ask "What does this mean?". Get a clear, spoken explanation instantly.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Mic className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Voice-Native Logging</h4>
                  <p className="text-gray-500">Just say "I took my meds" or "I had a salad for lunch". VoiceRx handles the rest.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-40">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase">The Interface of Tomorrow</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl font-medium">Designed for clarity, built for speed. Experience a health interface that feels like the future.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="group cursor-default">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
                  <MessageSquare className="text-blue-400" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Conversational Intelligence</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed pl-16">No more hunting through menus. Just ask, "What was my glucose level in the last report?" and get an immediate answer.</p>
            </div>
            
            <div className="group cursor-default">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="text-purple-400" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Automated OCR Engine</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed pl-16">Our OCR engine parses PDFs and images instantly, mapping biomarkers to your personal health timeline with 99.2% accuracy.</p>
            </div>

            <div className="group cursor-default">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Zap className="text-emerald-400" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Real-time Adherence</h3>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed pl-16">Smart reminders that adapt to your schedule. VoiceRx knows when you've taken your meds and when you need a nudge.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <GlassCard className="p-10 aspect-square flex flex-col gap-8 relative overflow-hidden group border-white/20 shadow-[0_0_50px_rgba(37,99,235,0.1)]">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none" />
              
              {/* Mock UI Elements */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-600/30">V</div>
                  <span className="font-black text-lg tracking-tight">VoiceRx Copilot</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live AI</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="self-end max-w-[85%] bg-blue-600 p-5 rounded-3xl rounded-tr-none text-sm font-bold shadow-xl shadow-blue-600/20">
                  "Analyze my latest blood work and tell me if my cholesterol is improving."
                </div>
                <div className="self-start max-w-[85%] bg-white/5 border border-white/10 p-5 rounded-3xl rounded-tl-none text-sm text-gray-300 font-medium leading-relaxed">
                  "I've analyzed your report from March 15th. Your LDL cholesterol has decreased by 12% since January. This is a great trend! Would you like to see the full breakdown?"
                </div>
                <div className="self-start w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mt-4 shadow-inner">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Biomarker Trend</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">-12.4%</span>
                  </div>
                  <div className="h-32 flex items-end gap-3">
                    {[30, 45, 35, 60, 40, 70, 55, 80, 65].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 0.8 }}
                        className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/60 rounded-t-xl" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 hidden md:block"
            >
              <GlassCard className="px-8 py-5 flex items-center gap-4 border-emerald-500/40 bg-emerald-500/5 backdrop-blur-2xl">
                <CheckCircle className="text-emerald-400" size={24} />
                <span className="text-lg font-black uppercase tracking-tight">HIPAA Verified</span>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 hidden md:block"
            >
              <GlassCard className="px-8 py-5 flex items-center gap-4 border-blue-500/40 bg-blue-500/5 backdrop-blur-2xl">
                <Activity className="text-blue-400" size={24} />
                <span className="text-lg font-black uppercase tracking-tight">99.2% Accuracy</span>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Pillars Section */}
      <section id="features" className="bg-white/[0.01] border-y border-white/5 py-48">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-16">
            <div className="space-y-8 group">
              <div className="w-20 h-20 bg-blue-600/20 rounded-[2rem] flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600/30 transition-all group-hover:rotate-6">
                <Shield className="text-blue-400" size={36} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter">Safety & Intelligence</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Our AI is trained on verified medical datasets and includes a multi-layer safety protocol. It detects emergencies instantly and provides clear, actionable advice while prioritizing clinical accuracy.</p>
              <ul className="space-y-4">
                {['Emergency Detection', 'Clinical Grounding', 'Conflict Alerts'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-black text-gray-300 uppercase tracking-widest">
                    <CheckCircle size={18} className="text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 group">
              <div className="w-20 h-20 bg-emerald-600/20 rounded-[2rem] flex items-center justify-center border border-emerald-500/30 group-hover:bg-emerald-600/30 transition-all group-hover:-rotate-6">
                <Apple className="text-emerald-400" size={36} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter">Diet Intelligence</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Personalized nutrition that understands your medical profile. VoiceRx creates meal plans that account for your allergies, chronic conditions, and fitness goals automatically.</p>
              <ul className="space-y-4">
                {['Allergy-Aware Planning', 'Macro Tracking', 'Meal Prep Guides'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-black text-gray-300 uppercase tracking-widest">
                    <CheckCircle size={18} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8 group">
              <div className="w-20 h-20 bg-purple-600/20 rounded-[2rem] flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-600/30 transition-all group-hover:rotate-6">
                <Brain className="text-purple-400" size={36} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tighter">Personalization Engine</h3>
              <p className="text-gray-400 text-lg leading-relaxed">The more you talk, the smarter it gets. VoiceRx learns your habits, preferences, and health patterns to provide increasingly precise coaching and reminders.</p>
              <ul className="space-y-4">
                {['Habit Learning', 'Contextual Reminders', 'Adaptive Coaching'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm font-black text-gray-300 uppercase tracking-widest">
                    <CheckCircle size={18} className="text-purple-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="max-w-7xl mx-auto px-6 py-48">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase">Built for Everyone</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl font-medium">Healthcare is universal. VoiceRx is designed to be accessible to every generation.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {targetUsers.map((user, i) => (
            <GlassCard key={i} className="p-12 hover:bg-white/5 transition-all group hover:-translate-y-2">
              <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:bg-blue-600/20 transition-all">
                <div className="text-blue-400 scale-125">{user.icon}</div>
              </div>
              <h3 className="text-3xl font-black mb-6 uppercase tracking-tight">{user.name}</h3>
              <p className="text-gray-400 text-lg leading-relaxed">{user.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="border-y border-white/5 py-48 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-32 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter uppercase">Powered by <br />World-Class AI</h2>
              <p className="text-gray-400 text-xl mb-16 leading-relaxed font-medium">We leverage the most advanced AI models to ensure clinical precision and human-like interaction. Our stack is built for scale, speed, and security.</p>
              
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                    <Code size={20} className="text-blue-500" />
                    Gemini 3.1 Pro
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Advanced medical reasoning and report analysis.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                    <Globe size={20} className="text-emerald-500" />
                    Native TTS
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Low-latency, high-fidelity voice generation.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                    <Lock size={20} className="text-purple-500" />
                    AES-256
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Military-grade encryption for all user data.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-sm">
                    <Zap size={20} className="text-orange-500" />
                    Edge Compute
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Optimized for sub-second response times.</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <GlassCard className="p-10 aspect-square flex flex-col items-center justify-center text-center gap-6 border-white/20 shadow-2xl">
                  <div className="text-6xl font-black text-blue-500 tracking-tighter">99%</div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">OCR Accuracy</div>
                </GlassCard>
                <GlassCard className="p-10 aspect-square flex flex-col items-center justify-center text-center gap-6 border-white/20 shadow-2xl">
                  <div className="text-6xl font-black text-emerald-500 tracking-tighter">24/7</div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Availability</div>
                </GlassCard>
              </div>
              <div className="space-y-6 pt-16">
                <GlassCard className="p-10 aspect-square flex flex-col items-center justify-center text-center gap-6 border-white/20 shadow-2xl">
                  <div className="text-6xl font-black text-purple-500 tracking-tighter">0.8s</div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Latency</div>
                </GlassCard>
                <GlassCard className="p-10 aspect-square flex flex-col items-center justify-center text-center gap-6 border-white/20 shadow-2xl">
                  <div className="text-6xl font-black text-orange-500 tracking-tighter">100%</div>
                  <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Encrypted</div>
                </GlassCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="max-w-7xl mx-auto px-6 py-48">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase">Our Vision</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl font-medium">We're not just building an app; we're building the future of human-health interaction.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {roadmap.map((phase, i) => (
            <GlassCard key={i} className="p-12 relative overflow-hidden group border-white/20">
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] rounded-full -z-10 ${
                phase.status === 'Completed' ? 'bg-emerald-500/20' : 
                phase.status === 'In Progress' ? 'bg-blue-500/20' : 'bg-purple-500/20'
              }`} />
              
              <div className="flex items-center justify-between mb-10">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">{phase.phase}</span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${
                  phase.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  phase.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
                  'bg-white/5 border-white/10 text-gray-500'
                }`}>
                  {phase.status}
                </span>
              </div>
              
              <h3 className="text-3xl font-black mb-8 uppercase tracking-tight">{phase.title}</h3>
              <ul className="space-y-6">
                {phase.items.map(item => (
                  <li key={item} className="flex items-center gap-4 text-gray-400 font-bold text-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      phase.status === 'Completed' ? 'bg-emerald-500' : 
                      phase.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-700'
                    }`} />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="max-w-5xl mx-auto px-6 py-48">
        <GlassCard className="p-20 text-center relative overflow-hidden border-white/20 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
          <h2 className="text-5xl md:text-8xl font-black mb-12 leading-none tracking-tighter uppercase">The VoiceRx Impact</h2>
          <div className="grid md:grid-cols-3 gap-16">
            <div className="space-y-2">
              <div className="text-7xl font-black text-white tracking-tighter">40%</div>
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Better Adherence</p>
            </div>
            <div className="space-y-2">
              <div className="text-7xl font-black text-white tracking-tighter">15m</div>
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Saved per Day</p>
            </div>
            <div className="space-y-2">
              <div className="text-7xl font-black text-white tracking-tighter">0</div>
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Complexity</p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-60 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 blur-[160px] -z-10 rounded-full" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-7xl md:text-[12rem] font-black mb-16 tracking-tighter leading-[0.8] uppercase">
            READY FOR THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              NEXT CHAPTER?
            </span>
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
            <button
              onClick={() => navigate('/login')}
              className="px-16 py-8 bg-white text-black rounded-[2.5rem] font-black text-3xl hover:bg-gray-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-4 hover:scale-105 active:scale-95"
            >
              Get Started Now
              <Rocket size={32} />
            </button>
            <button className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-3xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
              Contact Sales
            </button>
          </div>
          
          <p className="mt-20 text-gray-500 font-black uppercase tracking-[0.5em] text-sm">Join 10,000+ users transforming their health</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid md:grid-cols-4 gap-20 mb-32">
          <div className="col-span-2">
            <div className="flex items-center gap-3 font-black text-white text-4xl mb-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-xl shadow-blue-600/20">V</div>
              <span className="tracking-tighter">VoiceRx</span>
            </div>
            <p className="text-gray-500 max-w-sm text-xl leading-relaxed font-medium">
              The world's first voice-native AI health copilot. Empowering individuals through accessible, intelligent health management.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-xs">Product</h4>
            <ul className="space-y-6 text-gray-500 font-bold uppercase tracking-widest text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#safety" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black mb-10 uppercase tracking-[0.3em] text-xs">Company</h4>
            <ul className="space-y-6 text-gray-500 font-bold uppercase tracking-widest text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-gray-600 text-xs font-black uppercase tracking-[0.4em]">
          <div>© 2026 VoiceRx AI. All rights reserved.</div>
          <div className="flex gap-12">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
