const { getSettings, updateSettings } = require("./settings");
const { getAnalytics, incrementGptRequest } = require("./analytics");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { OpenAI } = require("openai");

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.post("/api/ai-reply", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    incrementGptRequest(); // Track GPT requests

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-3.5-turbo",
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong with AI response" });
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route
app.get("/", (req, res) => {
  res.send("🔥 OLAMYKxVBOT backend is live!");
});

// AI Reply Endpoint (now expects `prompt` from frontend)
app.post("/api/ai-reply", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
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
// Settings endpoints
app.get("/api/settings", getSettings);
app.post("/api/settings", updateSettings);

// Analytics endpoint
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

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});

