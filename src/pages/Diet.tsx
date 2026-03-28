import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Utensils, RefreshCw } from 'lucide-react';
import { DietPlan } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export function Diet() {
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchPlan();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/diet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.plan_json) {
        try {
          setPlan(JSON.parse(data.plan_json));
        } catch (e) {
          console.error("Failed to parse diet plan JSON", e);
        }
      }
    } catch (err) {
      console.error("Failed to fetch diet plan", err);
    }
  };

  const generatePlan = async () => {
    setIsLoading(true);
    try {
      const systemInstruction = `You are VoiceRx, a healthcare AI assistant. 
      User Profile: ${JSON.stringify(profile || {})}
      
      STRICT RULES:
      1. Diet plan MUST be based on the user's medical conditions and profile.
      2. If the user has diabetes, BP, heart issues, or any deficiency, prioritize that.
      3. If a nutrient deficiency is mentioned (Vitamin D, B12, Iron, etc.), include rich food sources.
      4. Generate a 7-day healthy diet plan in JSON format.
      5. Structure: { days: [{ day: 1, meals: { breakfast: { name, calories }, lunch, dinner, snacks: [] } }] }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate a 7-day personalized diet plan.",
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.INTEGER },
                    meals: {
                      type: Type.OBJECT,
                      properties: {
                        breakfast: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            calories: { type: Type.INTEGER }
                          }
                        },
                        lunch: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            calories: { type: Type.INTEGER }
                          }
                        },
                        dinner: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            calories: { type: Type.INTEGER }
                          }
                        },
                        snacks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      const planData = JSON.parse(response.text || "{}");
      
      // Save to server
      await fetch('/api/diet/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(planData)
      });

      setPlan(planData);
    } catch (err) {
      console.error("Failed to generate diet plan", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 pt-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Diet Plan</h1>
        <button onClick={generatePlan} disabled={isLoading} className="bg-blue-600 p-2 rounded-full text-white disabled:opacity-50">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {!plan ? (
        <div className="text-center py-12">
          <Utensils size={64} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No diet plan generated yet.</p>
          <button onClick={generatePlan} className="mt-4 bg-blue-600 px-6 py-2 rounded-lg text-white font-semibold">Generate 7-Day Plan</button>
        </div>
      ) : (
        <div className="space-y-6">
          {plan.days.map(day => (
            <div key={day.day}>
              <h3 className="text-xl font-bold text-white mb-3">Day {day.day}</h3>
              <GlassCard>
                <div className="space-y-3 p-4">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-blue-300 font-medium">Breakfast</span>
                    <span className="text-gray-200">{day.meals.breakfast.name} ({day.meals.breakfast.calories} cal)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-blue-300 font-medium">Lunch</span>
                    <span className="text-gray-200">{day.meals.lunch.name} ({day.meals.lunch.calories} cal)</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-blue-300 font-medium">Dinner</span>
                    <span className="text-gray-200">{day.meals.dinner.name} ({day.meals.dinner.calories} cal)</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
