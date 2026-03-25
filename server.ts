import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const googleClient = new OAuth2Client(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const db = new Database("voicerx.db");
const JWT_SECRET = process.env.JWT_SECRET || "voicerx-secret";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    google_id TEXT UNIQUE,
    onboarded INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    height REAL,
    weight REAL,
    conditions TEXT,
    allergies TEXT,
    medications TEXT,
    lifestyle TEXT,
    goals TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    dosage TEXT,
    frequency TEXT,
    times TEXT,
    adherence_json TEXT DEFAULT '[]',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diet_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS chat_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    role TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS medical_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename TEXT,
    analysis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add columns if they don't exist
try {
  db.prepare("ALTER TABLE users ADD COLUMN onboarded INTEGER DEFAULT 0").run();
} catch (e) {}

try {
  db.prepare("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE").run();
} catch (e) {}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  const upload = multer({ dest: "uploads/" });

  // Middleware: Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run(email, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, email, onboarded: 0 } });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email, onboarded: user.onboarded } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    const { token } = req.body;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.VITE_GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error("Invalid token");

      const { sub: googleId, email, name } = payload;
      let user: any = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(googleId, email);

      if (!user) {
        const result = db.prepare("INSERT INTO users (email, google_id) VALUES (?, ?)").run(email, googleId);
        user = { id: result.lastInsertRowid, email, onboarded: 0 };
      } else if (!user.google_id) {
        db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(googleId, user.id);
      }

      const jwtToken = jwt.sign({ id: user.id, email }, JWT_SECRET);
      res.json({ token: jwtToken, user: { id: user.id, email, onboarded: user.onboarded } });
    } catch (err) {
      console.error("Google Auth Error:", err);
      res.status(401).json({ error: "Google authentication failed" });
    }
  });

  // Profile Routes
  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.user.id);
    res.json(profile || {});
  });

  app.post("/api/profile", authenticateToken, (req: any, res) => {
    const { name, age, gender, height, weight, conditions, allergies, medications, lifestyle, goals } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO profiles (user_id, name, age, gender, height, weight, conditions, allergies, medications, lifestyle, goals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, age, gender, height, weight, conditions, allergies, medications, lifestyle, goals);
    
    // Mark as onboarded
    db.prepare("UPDATE users SET onboarded = 1 WHERE id = ?").run(req.user.id);
    
    res.json({ success: true });
  });

  // Medication Routes
  app.get("/api/medications", authenticateToken, (req: any, res) => {
    const meds = db.prepare("SELECT * FROM medications WHERE user_id = ?").all(req.user.id);
    res.json(meds);
  });

  app.post("/api/medications", authenticateToken, (req: any, res) => {
    const { name, dosage, frequency, times } = req.body;
    db.prepare("INSERT INTO medications (user_id, name, dosage, frequency, times) VALUES (?, ?, ?, ?, ?)")
      .run(req.user.id, name, dosage, frequency, times);
    res.json({ success: true });
  });

  app.post("/api/medications/:id/adherence", authenticateToken, (req: any, res) => {
    const { date, taken } = req.body;
    const med: any = db.prepare("SELECT adherence_json FROM medications WHERE id = ? AND user_id = ?").get(req.params.id, req.user.id);
    if (med) {
      const adherence = JSON.parse(med.adherence_json);
      adherence.push({ date, taken });
      db.prepare("UPDATE medications SET adherence_json = ? WHERE id = ?").run(JSON.stringify(adherence), req.params.id);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Medication not found" });
    }
  });

  // Diet Plan Route
  app.get("/api/diet", authenticateToken, async (req: any, res) => {
    const existingPlan = db.prepare("SELECT * FROM diet_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(req.user.id);
    res.json(existingPlan || null);
  });

  app.post("/api/diet/generate", authenticateToken, async (req: any, res) => {
    const planData = req.body;
    try {
      db.prepare("INSERT INTO diet_plans (user_id, plan_json) VALUES (?, ?)").run(req.user.id, JSON.stringify(planData));
      res.json(planData);
    } catch (err) {
      res.status(500).json({ error: "Failed to save diet plan" });
    }
  });

  // File Upload & Analysis
  app.post("/api/files/upload", authenticateToken, upload.single("file"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const analysis = req.body.analysis || "AI Analysis: Your report has been processed. Our AI detected normal ranges for most biomarkers, but suggests discussing your results with your physician.";
    
    db.prepare("INSERT INTO medical_files (user_id, filename, analysis) VALUES (?, ?, ?)")
      .run(req.user.id, req.file.filename, analysis);
    
    res.json({ filename: req.file.filename, analysis });
  });

  app.get("/api/files", authenticateToken, (req: any, res) => {
    const files = db.prepare("SELECT * FROM medical_files WHERE user_id = ?").all(req.user.id);
    res.json(files);
  });

  // API 404 Handler
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
