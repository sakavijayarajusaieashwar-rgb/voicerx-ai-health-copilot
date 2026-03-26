import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { motion, AnimatePresence } from 'motion/react';

export function Onboarding() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Male',
    height: '', weight: '',
    conditions: '', allergies: '',
    medications: '', lifestyle: '', goals: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // ✅ FIXED SUBMIT
  const handleSubmit = async () => {
    if (!token) {
      alert("User not logged in");
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Profile creation failed");
        return;
      }

      navigate('/');

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  // 🧠 ANALYZE FILE (DEMO SAFE)
  const analyzeFile = async () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      setAnalysis(`
🧾 Report Summary:
- High Blood Sugar
- Vitamin D deficiency
- Mild anemia

🥗 Recommendations:
- Reduce sugar intake
- Eat green vegetables
- Sun exposure

⚠️ Consult doctor if needed
      `);
      setIsAnalyzing(false);
    }, 1500);
  };

  // 🧪 SAMPLE ANALYSIS
  const runSampleAnalysis = () => {
    setAnalysis(`
🧾 Sample Report:
- Diabetes risk detected
- Low B12
- High cholesterol

🥗 Advice:
- Avoid sugar
- Exercise daily
- Eat protein-rich foods
    `);
  };

  // 📄 DOWNLOAD SAMPLE PDF
  const downloadSamplePDF = () => {
    const content = `
Sample Medical Report

Patient: John Doe
Age: 55

Blood Sugar: High
Vitamin D: Low
Hemoglobin: Low

Advice:
- Reduce sugar
- Eat leafy vegetables
- Sunlight exposure
    `;

    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-medical-report.pdf";
    a.click();
  };

  const renderStep = () => {
    switch (step) {

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Basic Info</h2>

            <input placeholder="Name" className="input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} />

            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Age" type="number" className="input"
                value={formData.age}
                onChange={e => setFormData({...formData, age: e.target.value})} />

              <select className="input"
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Medical History</h2>

            <textarea placeholder="Conditions" className="input h-24"
              value={formData.conditions}
              onChange={e => setFormData({...formData, conditions: e.target.value})} />

            <textarea placeholder="Allergies" className="input h-24"
              value={formData.allergies}
              onChange={e => setFormData({...formData, allergies: e.target.value})} />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Upload Report</h2>

            {/* 📄 Upload */}
            <input
              type="file"
              className="text-white"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            {/* 📥 Download sample */}
            <button
              onClick={downloadSamplePDF}
              className="bg-gray-700 px-4 py-2 rounded text-white"
            >
              Download Sample PDF
            </button>

            {/* Analyze */}
            <button
              onClick={analyzeFile}
              className="bg-blue-600 px-4 py-2 rounded text-white"
            >
              Analyze Report
            </button>

            {/* Demo */}
            <button
              onClick={runSampleAnalysis}
              className="bg-purple-600 px-4 py-2 rounded text-white"
            >
              Use Sample
            </button>

            {isAnalyzing && <p className="text-gray-400">Analyzing...</p>}

            {analysis && (
              <div className="bg-white/5 p-4 rounded text-white whitespace-pre-line">
                {analysis}
              </div>
            )}
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
            <motion.div key={step}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between">
            {step > 1 && <button onClick={handleBack}>Back</button>}
            <div className="flex-1" />

            {step < 3 ? (
              <button onClick={handleNext} className="bg-blue-600 px-4 py-2 text-white">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 text-white">
                Complete
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}