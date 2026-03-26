import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import multer from "multer";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ENV VARIABLES (FIXED)
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || "voicerx-secret";

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
);

// Ensure uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Database
const db = new Database("voicerx.db");

// Tables
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
  goals TEXT
);

CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  dosage TEXT,
  frequency TEXT,
  times TEXT,
  adherence_json TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS diet_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  plan_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  filename TEXT,
  analysis TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static("uploads"));

  const upload = multer({ dest: "uploads/" });

  // 🔐 Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // ================= AUTH =================

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    try {
      const result = db
        .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
        .run(email, hashed);

      const token = jwt.sign(
        { id: result.lastInsertRowid, email },
        JWT_SECRET
      );

      res.json({ token });
    } catch {
      res.status(400).json({ error: "User exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const user: any = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/google", async (req, res) => {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: req.body.token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const email = payload?.email;
      const googleId = payload?.sub;

      let user: any = db
        .prepare("SELECT * FROM users WHERE google_id = ? OR email = ?")
        .get(googleId, email);

      if (!user) {
        const result = db
          .prepare("INSERT INTO users (email, google_id) VALUES (?, ?)")
          .run(email, googleId);

        user = { id: result.lastInsertRowid, email };
      }

      const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
      res.json({ token });
    } catch (err) {
      res.status(401).json({ error: "Google auth failed" });
    }
  });

  // ================= PROFILE =================

  app.get("/api/profile", authenticateToken, (req: any, res) => {
    const profile = db
      .prepare("SELECT * FROM profiles WHERE user_id = ?")
      .get(req.user.id);
    res.json(profile || {});
  });

  app.post("/api/profile", authenticateToken, (req: any, res) => {
    db.prepare(`
      INSERT OR REPLACE INTO profiles 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      req.body.name,
      req.body.age,
      req.body.gender,
      req.body.height,
      req.body.weight,
      req.body.conditions,
      req.body.allergies,
      req.body.medications,
      req.body.lifestyle,
      req.body.goals
    );

    res.json({ success: true });
  });

  // ================= MEDICATION =================

  app.get("/api/medications", authenticateToken, (req: any, res) => {
    const meds = db
      .prepare("SELECT * FROM medications WHERE user_id = ?")
      .all(req.user.id);
    res.json(meds);
  });

  app.post("/api/medications", authenticateToken, (req: any, res) => {
    db.prepare(
      "INSERT INTO medications (user_id, name, dosage) VALUES (?, ?, ?)"
    ).run(req.user.id, req.body.name, req.body.dosage);

    res.json({ success: true });
  });

  // ================= FILE UPLOAD =================

  app.post(
    "/api/files/upload",
    authenticateToken,
    upload.single("file"),
    (req: any, res) => {
      res.json({
        file: req.file?.filename,
        analysis: "AI processed report successfully",
      });
    }
  );

  // ================= FRONTEND =================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running: http://localhost:${PORT}`);
  });
}

startServer();