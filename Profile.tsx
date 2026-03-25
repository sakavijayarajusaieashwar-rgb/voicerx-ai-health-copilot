import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { User, LogOut, Settings, Shield, ArrowLeft, Bell, CreditCard, HelpCircle, ChevronRight, Heart, Activity, Ruler, Weight } from 'lucide-react';
import { motion } from 'motion/react';

export function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setProfile(data));
  }, []);

  const settingsItems = [
    { icon: Settings, label: 'Account Settings', desc: 'Manage your personal information', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Control your data and encryption', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Bell, label: 'Notifications', desc: 'Configure health alerts and reminders', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: CreditCard, label: 'Subscription', desc: 'Manage your VoiceRx Pro plan', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: HelpCircle, label: 'Support', desc: 'Get help or contact our medical team', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-40 pt-8 px-6 max-w-2xl mx-auto overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="text-xl font-black text-white uppercase tracking-widest">Profile</h1>
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 relative z-10"
      >
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse" />
            <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] flex items-center justify-center border-4 border-white/10 shadow-2xl relative z-10">
              <User size={64} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-slate-950 rounded-2xl flex items-center justify-center text-white z-20">
              <Shield size={18} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-white mb-1">{profile?.name || 'User'}</h2>
          <p className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4">Health ID: #VRX-9921</p>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs font-medium">
            <Activity size={14} className="text-emerald-500" />
            Voice Profile Verified
          </div>
        </div>
      </motion.div>

      {/* Health Summary Grid */}
      <div className="grid grid-cols-2 gap-4 mb-12 relative z-10">
        {[
          { label: 'Age', value: profile?.age || '--', icon: User, color: 'text-blue-400' },
          { label: 'Blood', value: 'O+', icon: Heart, color: 'text-rose-400' },
          { label: 'Weight', value: `${profile?.weight || '--'} kg`, icon: Weight, color: 'text-emerald-400' },
          { label: 'Height', value: `${profile?.height || '--'} cm`, icon: Ruler, color: 'text-purple-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-5 flex items-center gap-4">
              <div className={stat.color}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-white font-black text-lg">{stat.value}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Settings List */}
      <div className="space-y-3 mb-12 relative z-10">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-4 px-2">Settings & Preferences</h3>
        {settingsItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <GlassCard className="p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className={`${item.bg} ${item.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={logout}
        className="w-full bg-rose-600/10 border border-rose-600/20 p-5 rounded-[2rem] flex items-center justify-center gap-3 text-rose-500 font-black text-sm uppercase tracking-widest hover:bg-rose-600/20 transition-all relative z-10"
      >
        <LogOut size={20} />
        Logout Session
      </motion.button>
    </div>
  );
}
