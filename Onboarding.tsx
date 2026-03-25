import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { motion, AnimatePresence } from 'motion/react';

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male', height: '', weight: '',
    conditions: '', allergies: '', medications: '', lifestyle: '', goals: ''
  });
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData),
    });
    navigate('/');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Basic Info</h2>
            <input placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Age" type="number" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Height (cm)" type="number" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} />
              <input placeholder="Weight (kg)" type="number" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Medical History</h2>
            <textarea placeholder="Existing Conditions" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white h-24" value={formData.conditions} onChange={e => setFormData({...formData, conditions: e.target.value})} />
            <textarea placeholder="Allergies" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white h-24" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Lifestyle & Goals</h2>
            <textarea placeholder="Lifestyle (Diet, Activity, Smoking)" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white h-24" value={formData.lifestyle} onChange={e => setFormData({...formData, lifestyle: e.target.value})} />
            <textarea placeholder="Health Goals" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white h-24" value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <GlassCard>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex justify-between">
            {step > 1 && <button onClick={handleBack} className="text-gray-400 font-medium">Back</button>}
            <div className="flex-1" />
            {step < 3 ? (
              <button onClick={handleNext} className="bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold">Next</button>
            ) : (
              <button onClick={handleSubmit} className="bg-green-600 px-6 py-2 rounded-lg text-white font-semibold">Complete</button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
