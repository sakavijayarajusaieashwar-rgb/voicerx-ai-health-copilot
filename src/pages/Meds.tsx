import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Plus, Check, Clock } from 'lucide-react';
import { Medication } from '../types';
import { format } from 'date-fns';

export function Meds() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: '', times: '' });
  const { token } = useAuth();

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    const res = await fetch('/api/medications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setMeds(data);
  };

  const handleAdd = async () => {
    await fetch('/api/medications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newMed),
    });
    setShowAdd(false);
    fetchMeds();
  };

  const markTaken = async (id: number) => {
    await fetch(`/api/medications/${id}/adherence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ date: new Date().toISOString(), taken: true }),
    });
    fetchMeds();
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Medications</h1>
        <button onClick={() => setShowAdd(true)} className="bg-blue-600 p-2 rounded-full text-white"><Plus /></button>
      </div>

      {showAdd && (
        <GlassCard className="mb-6">
          <div className="space-y-4">
            <input placeholder="Medication Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} />
            <input placeholder="Dosage (e.g. 500mg)" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
            <input placeholder="Times (e.g. 08:00, 20:00)" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" value={newMed.times} onChange={e => setNewMed({...newMed, times: e.target.value})} />
            <button onClick={handleAdd} className="w-full bg-blue-600 py-2 rounded-lg text-white font-semibold">Add Medication</button>
          </div>
        </GlassCard>
      )}

      <div className="space-y-4">
        {meds.map(med => (
          <div key={med.id}>
            <GlassCard className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{med.name}</h3>
                <p className="text-gray-400 text-sm">{med.dosage} • {med.times}</p>
              </div>
              <button
                onClick={() => markTaken(med.id)}
                className="bg-green-600/20 text-green-400 p-3 rounded-xl hover:bg-green-600/40 transition-colors"
              >
                <Check size={24} />
              </button>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
