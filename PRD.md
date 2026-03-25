# Product Requirements Document: VoiceRx

## 1. Project Overview
**VoiceRx** is a voice-first AI health companion designed to simplify healthcare management through natural language interaction. It combines advanced medical report analysis (OCR), personalized health coaching, medication tracking, and diet planning into a single, accessible interface.

### 1.1 Mission
To empower individuals to take control of their health by providing clear, actionable, and voice-accessible medical insights.

---

## 2. Target Audience
- **Seniors:** Who may find traditional app interfaces complex and prefer voice interaction.
- **Chronic Patients:** Who need to manage multiple medications and track biomarkers regularly.
- **Health Enthusiasts:** Who want a centralized place for their medical reports and personalized diet plans.
- **Busy Professionals:** Who need quick, simplified summaries of their health status.

---

## 3. Key Features

### 3.1 Voice-First Onboarding
- **Description:** A conversational setup process where the AI asks health-related questions (age, conditions, allergies) and the user responds via voice.
- **Requirement:** AI must speak the questions clearly and accurately transcribe user responses.

### 3.2 AI Health Copilot (Chat)
- **Description:** A real-time chat interface for health queries.
- **Requirement:** 
    - Responses must be dual-format: Detailed medical text and a simplified "audio-friendly" version.
    - Native TTS (Text-to-Speech) for immediate audio feedback.
    - Emergency detection with visual and audio alerts.

### 3.3 Medical Report Analysis (OCR)
- **Description:** Users can upload PDFs or images of medical reports for AI analysis.
- **Requirement:**
    - Extract key biomarkers and provide a summary.
    - Provide an "audio-friendly" summary that can be played back.
    - Store analysis history for future reference.

### 3.4 Medication Management
- **Description:** A dedicated tracker for daily medications.
- **Requirement:**
    - Add medications with dosage and frequency.
    - Log adherence (taken/missed).
    - Visual progress tracking.

### 3.5 Personalized Diet Planning
- **Description:** AI-generated diet plans based on the user's medical profile and goals.
- **Requirement:**
    - Integration with the user's health profile (allergies, conditions).
    - Daily meal breakdown.

---

## 4. User Flow
1. **Landing:** User enters the app and signs up/logs in (Email or Google).
2. **Onboarding:** New users go through the Voice Onboarding to build their profile.
3. **Dashboard:** Central hub showing health stats, next medications, and quick actions.
4. **Interaction:** User either chats with the Copilot, uploads a report, or checks their medication list.
5. **Insights:** User receives spoken and written feedback on their health queries or reports.

---

## 5. Technical Stack
- **Frontend:** React (TypeScript), Tailwind CSS, Lucide Icons, Motion (Animations).
- **Backend:** Node.js (Express), SQLite (Better-SQLite3).
- **AI/ML:** 
    - **Gemini 3.1 Pro:** For complex medical reasoning and report analysis.
    - **Gemini 2.5 Flash TTS:** For high-fidelity, low-latency text-to-speech.
    - **Web Speech API:** For speech-to-text (STT) transcription.
- **Authentication:** JWT-based auth with Google OAuth integration.

---

## 6. Design Principles
- **Glassmorphism:** Modern, translucent UI elements for a premium feel.
- **Accessibility:** Large touch targets, high contrast, and voice-first navigation.
- **Clarity:** Simplified medical jargon in audio responses.

---

## 7. Future Roadmap
- **V2:** Integration with wearable devices (Apple Health, Fitbit).
- **V2:** Multi-speaker support for family health management.
- **V3:** Real-time video consultation integration.
- **V3:** Predictive health alerts based on historical biomarker trends.
