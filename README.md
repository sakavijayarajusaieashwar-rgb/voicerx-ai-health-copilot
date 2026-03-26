# 🚀 VoiceRx – AI Health Copilot

VoiceRx is a **voice-first AI healthcare assistant** designed to simplify daily health management using natural conversations.

---

## 🧠 Features

* 🎙️ Voice-first interaction (Speech-to-Text + Text-to-Speech)
* 🤖 AI-powered health copilot
* 💊 Medication tracking & reminders
* 🥗 Personalized diet recommendations
* 📄 Medical report analysis (OCR + AI)
* 🚨 Emergency detection system

---

## 🛠️ Tech Stack

* Frontend: React + Vite
* Backend: Node.js + Express
* AI: Mistral AI
* Voice:

  * Murf AI (Text-to-Speech)
  * Web Speech API (Speech-to-Text)
* Auth: Google OAuth

---

## 🔌 API Usage

### 🧠 Mistral AI

Used for:

* Health reasoning
* Personalized responses

### 🎙️ Murf AI

Used for:

* Converting AI responses into natural voice

Example:

```js
POST https://api.murf.ai/v1/speech/generate
```

---

## 🔐 Environment Variables

Create a `.env` file:

```
VITE_MURF_API_KEY=your_murf_api_key
VITE_MISTRAL_API_KEY=your_mistral_api_key
```

⚠️ Never commit `.env` file to GitHub

---

## ⚙️ Setup Instructions

```bash
git clone https://github.com/your-username/voicerx.git
cd voicerx
npm install
npm run dev
```

---

## 🎥 Demo Video

👉 Add your demo video link here (Google Drive / YouTube)

---

## 🌱 Vision

To make healthcare simple, accessible, and proactive using voice-first AI.

---

## 🏷️ Tags

murf-ai, healthcare, ai, voice-assistant, react, nodejs

Demovideo:
https://drive.google.com/file/d/1pzZK-Ynm5OfP5xjLG9js4Kt6dZ1by1GO/view?usp=drive_link
