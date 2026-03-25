🎙️ VoiceRx – AI Health Copilot

VoiceRx is a voice-first AI healthcare assistant designed to help users manage their health through simple conversations. It combines AI reasoning, speech recognition, and text-to-speech to provide a human-like health companion experience.

---

🚀 Features

🎙️ Voice-First Interaction

- Speak naturally instead of typing
- AI listens and responds in voice
- Supports multi-language input (English, Hindi, Telugu)

🧠 AI Health Assistant

- Powered by Mistral AI
- Provides simple, safe, and personalized health advice
- Context-aware responses based on user profile

👤 Personalized Health Profile

- Stores:
  - Age
  - Gender
  - Medical conditions
  - Medications
- AI tailors responses based on profile

🚨 Emergency Detection

- Detects critical symptoms:
  - Chest pain
  - Breathing difficulty
- Provides urgent guidance (call emergency services)

💊 Medication Management

- Add medications with schedule
- Track daily doses
- Mark medicines as taken

🥗 AI Diet & Nutrition

- Generates personalized diet plans
- Handles deficiencies:
  - Vitamin D
  - B12
  - Iron
- Suggests:
  - Food sources
  - Lifestyle changes

📁 Medical File Vault

- Upload reports (PDF, images)
- AI extracts key insights
- Secure storage

---

🛠️ Tech Stack

Frontend

- React + Vite
- Glassmorphism UI design
- Web Speech API (Speech-to-Text)

Backend

- Node.js + Express
- REST API architecture

AI Services

- Mistral AI → Chat & reasoning
- Murf AI → Text-to-Speech (voice output)

Authentication

- Google OAuth 2.0
- JWT-based sessions

---

⚙️ Installation

1. Clone the repository

git clone https://github.com/your-username/voicerx.git
cd voicerx

---

2. Backend setup

cd backend
npm install

Create ".env" file:

MISTRAL_API_KEY=your_key
MURF_API_KEY=your_key

Run server:

node index.js

---

3. Frontend setup

cd frontend
npm install
npm run dev

---

🌐 Usage

1. Open the app in browser
2. Complete onboarding (profile setup)
3. Click 🎙️ mic and speak
4. AI responds with:
   - Text
   - Voice

---

🧠 Example

User:
"I feel dizzy"

AI:
"Since you have diabetes, dizziness may be due to low sugar. Please check your sugar levels and eat something. Consult a doctor if symptoms persist."

---

🔐 Security & Privacy

- Secure authentication via Google OAuth
- JWT-based API protection
- No sensitive data shared externally
- AI responses include medical disclaimer

---

⚠️ Disclaimer

VoiceRx provides AI-generated health guidance for informational purposes only.
It is not a substitute for professional medical advice.

---

🚀 Future Improvements

- Wearable integration (Apple Health, Google Fit)
- Caregiver dashboard
- Offline mode
- Advanced health analytics

---

💡 Vision

To build a voice-based healthcare companion that makes health management simple, accessible, and personalized for everyone.

---

👨‍💻 Author

Developed by Sai Eashwar

---

⭐ Support

If you like this project, give it a ⭐ on GitHub!
