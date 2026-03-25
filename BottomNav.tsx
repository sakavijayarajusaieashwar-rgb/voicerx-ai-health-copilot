import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Pill, Utensils, FileText, User, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function BottomNav() {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/meds', icon: Pill, label: 'Meds' },
    { to: '/diet', icon: Utensils, label: 'Diet' },
    { to: '/files', icon: FileText, label: 'Files' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg">
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-500 group",
                isActive ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-500/10 rounded-2xl border border-blue-500/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon size={20} className={cn("relative z-10 transition-transform duration-300", isActive && "scale-110")} />
                <span className="relative z-10 text-[10px] font-black uppercase tracking-widest hidden sm:block">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </motion.nav>
    </div>
  );
}
