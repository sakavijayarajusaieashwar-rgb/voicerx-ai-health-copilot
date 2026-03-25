import React from 'react';

export function GlassCard({ children, className = '', ...props }: any) {
  return (
    <div 
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
