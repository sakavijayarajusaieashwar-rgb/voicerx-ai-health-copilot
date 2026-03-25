import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { VoiceOnboarding } from './pages/VoiceOnboarding';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Meds } from './pages/Meds';
import { Diet } from './pages/Diet';
import { Files } from './pages/Files';
import { Profile } from './pages/Profile';
import { BottomNav } from './components/BottomNav';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  return token ? <>{children}</> : <Navigate to="/landing" />;
}

function AppContent() {
  const { token, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/voice-onboarding" element={<PrivateRoute><VoiceOnboarding /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="/meds" element={<PrivateRoute><Meds /></PrivateRoute>} />
        <Route path="/diet" element={<PrivateRoute><Diet /></PrivateRoute>} />
        <Route path="/files" element={<PrivateRoute><Files /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={token ? "/" : "/landing"} />} />
      </Routes>
      {token && user?.onboarded && <BottomNav />}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
