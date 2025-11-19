/**
 * TrendPulse AI - Backend Server
 * 
 * Run this using: node backend/server.js
 * Required Env Vars: API_KEY, PORT
 */

const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- SAFETY CHECK ---
if (!process.env.API_KEY) {
    console.error("\n\x1b[31m[ERROR] API_KEY is missing in .env file!\x1b[0m");
    console.error("Please create a .env file in the root directory with:");
    console.error("API_KEY=YOUR_AI_KEY_HERE");
    console.error("PORT=3001");
    process.exit(1);
}

// Middleware
app.use(cors()); // Allows localhost requests
app.use(express.json({ limit: '50mb' })); // High limit for images

// Initialize AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- ROUTES ---

// 0. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TrendPulse Backend Online' });
});

// 1. Trend Analysis Route
app.post('/api/trends', async (req, res) => {
  try {
    const { category, language } = req.body;
    
    const prompt = `Identify 6 ultra-current viral trends on TikTok for: "${category}". 
    Focus on what is happening THIS WEEK. 
    Respond in JSON with fields: name, description, viralityScore, soundName, hashtags, exampleIdea, ugcExamples.
    ${language === 'de' ? 'Output strictly in German.' : 'Output strictly in English.'}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    const data = JSON.parse(response.text);
    res.json(data);
  } catch (error) {
    console.error('Trend API Error:', error);
    res.status(500).json({ error: "Failed to fetch trends", details: error.message });
  }
});

// 2. Content Generation Route
app.post('/api/generate-content', async (req, res) => {
  try {
    const { trendName, trendIdea, language } = req.body;
    
    const prompt = `Create a complete "Viral Content Package" for TikTok based on "${trendName}".
    Concept: ${trendIdea}.
    Include script, caption, hashtags, thumbnailText.
    ${language === 'de' ? 'Output strictly in German.' : 'Output strictly in English.'}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    res.json(JSON.parse(response.text));
  } catch (error) {
    res.status(500).json({ error: "Generation failed" });
  }
});

// 3. Veo Video Proxy (Securely uses API Key on server)
app.post('/api/render-video', async (req, res) => {
    try {
        const { description } = req.body;
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Vertical 9:16 TikTok Video. ${description}`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        // Proxy the video file to the client so client never needs the key
        const videoRes = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const videoBuffer = await videoRes.arrayBuffer();
        
        res.setHeader('Content-Type', 'video/mp4');
        res.send(Buffer.from(videoBuffer));

    } catch (error) {
        console.error("Veo Error:", error);
        res.status(500).json({ error: "Video rendering failed" });
    }
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 TrendPulse Backend running on port ${PORT}`);
  console.log(`✅ Secure API Key loaded: ${process.env.API_KEY.substring(0, 6)}...`);
  console.log(`📡 Ready for frontend requests on http://localhost:${PORT}\n`);
});