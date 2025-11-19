
/**
 * TrendPulse AI - Automation Worker
 * 
 * This script simulates a cronjob that would run every X hours 
 * to scan trends and save them to a database.
 */

const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const CATEGORIES = ['Tech', 'Business', 'Dance', 'Comedy', 'Lifestyle'];

async function runAutoScan() {
    console.log(`[${new Date().toISOString()}] 🤖 Auto-Pilot: Starting Scan Cycle...`);

    for (const category of CATEGORIES) {
        try {
            console.log(`Scanning Sector: ${category}...`);
            
            // 1. Fetch Trends
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `List 3 viral trends for ${category} right now. JSON format.`,
                config: { responseMimeType: "application/json" }
            });

            const trends = JSON.parse(response.text).trends || [];

            // 2. Save to Database (Mock code)
            // await db.trends.upsert(trends);
            
            console.log(`✅ Found ${trends.length} trends in ${category}. Saved to Database.`);

            // Sleep to avoid rate limits
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            console.error(`❌ Error scanning ${category}:`, e.message);
        }
    }

    console.log(`[${new Date().toISOString()}] 💤 Scan complete. Sleeping.`);
}

// Run immediately on start
runAutoScan();

// Keep alive (or schedule with node-cron in a real app)
setInterval(runAutoScan, 1000 * 60 * 60 * 6); // Run every 6 hours
