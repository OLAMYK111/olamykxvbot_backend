const express = require("express");
const app = express(); // ✅ Declare app early

const { getSettings, updateSettings } = require("./settings");
const { getAnalytics, incrementGptRequest } = require("./analytics");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");
const { connectToWhatsApp, getQRCode } = require("./whatsapp");

// Load env variables
dotenv.config();

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(cors());
app.use(express.json());

// Call connect function on startup
connectToWhatsApp();

// QR code endpoint
app.get("/api/whatsapp/qr", (req, res) => {
  const qr = getQRCode();
  if (!qr) return res.status(404).json({ message: "QR not ready yet" });
  res.json({ qr });
});

// Health check
app.get("/", (req, res) => {
  res.send("🔥 OLAMYKxVBOT backend is live!");
});

// AI Reply
app.post("/api/ai-reply", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    incrementGptRequest(); // Optional: track usage

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong with AI response" });
  }
});

// Settings
app.get("/api/settings", getSettings);
app.post("/api/settings", updateSettings);

// Analytics
app.get("/api/analytics", getAnalytics);

// Placeholder routes
app.get("/api/users", (req, res) => {
  res.json([{ username: "TestUser", phone: "+234...", status: "active" }]);
});

app.get("/api/settings", (req, res) => {
  res.json({ savageMode: true, autoReply: true });
});

app.get("/api/analytics", (req, res) => {
  res.json({ totalUsers: 1, activeChats: 12, gptRequests: 33 });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
