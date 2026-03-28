import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { GlassCard } from '../components/GlassCard';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.token, data.user);
        toast.success(isSignup ? 'Account created!' : 'Welcome back!');
        navigate(data.user.onboarded ? '/' : '/voice-onboarding');
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.token, data.user);
        toast.success('Google login successful!');
        navigate(data.user.onboarded ? '/' : '/voice-onboarding');
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (err) {
      toast.error('Google authentication error');
    }
  };

  const isGoogleConfigured = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-2xl mb-4 border border-blue-500/20">
            <Heart className="text-blue-500" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">VoiceRx</h1>
          <p className="text-gray-400">AI Health Copilot for Real-Time Care</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {isLoading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            {isGoogleConfigured ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Login Failed')}
                shape="pill"
                width="100%"
              />
            ) : (
              <div className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs text-center">
                Google Login is not configured. <br />
                Please set <code className="bg-amber-500/20 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in settings.
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
