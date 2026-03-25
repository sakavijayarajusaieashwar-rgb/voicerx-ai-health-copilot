export interface User {
  id: number;
  email: string;
}

export interface Profile {
  name: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  conditions: string;
  allergies: string;
  medications: string;
  lifestyle: string;
  goals: string;
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string;
  adherence_json: string;
}

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  audio?: string;
}

export interface DietPlan {
  days: {
    day: number;
    meals: {
      breakfast: { name: string; calories: number };
      lunch: { name: string; calories: number };
      dinner: { name: string; calories: number };
      snacks: { name: string; calories: number }[];
    };
  }[];
}
