import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Trend, AccountAnalysis, TrendCategory, VideoScript, ViralPrediction, ViralConcept, ContentPackage, CompetitorComparison, VisualAnalysis, Language, ScriptModifier, ChatMessage } from "../types";

// --- CONFIGURATION ---
// Setze dies auf TRUE, um dein Backend zu nutzen (empfohlen für Produktion)
const USE_BACKEND = true; 

// AUTOMATIC URL DETECTION:
// Wenn wir lokal sind (localhost), nutzen wir den lokalen Server (Port 3001).
// Wenn wir online sind (z.B. Render), nutzen wir die Produktions-URL.
const BACKEND_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? "http://localhost:3001/api"
    : "https://trendpulse-api.onrender.com/api"; // Deine Render URL für Produktion

// Fallback Keys (Falls USE_BACKEND = false und du Client-Side Only nutzt)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = "gemini-2.5-flash";
const imageModel = "imagen-4.0-generate-001"; 
const chatModel = "gemini-3-pro-preview";

// --- Helper for Retry Logic ---
async function callWithRetry<T>(fn: () => Promise<T>, retries = 5, delay = 12000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errString = JSON.stringify(error);
    const isQuotaError = 
      error.status === 429 || 
      error.code === 429 ||
      error.error?.code === 429 ||
      errString.includes("429") || 
      errString.includes("RESOURCE_EXHAUSTED");
    
    if (isQuotaError && retries > 0) {
      console.warn(`Quota hit (429). Retrying in ${delay/1000}s... (${retries} attempts left)`);
      const jitter = Math.random() * 2000; 
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return callWithRetry(fn, retries - 1, delay * 2); 
    }
    throw error;
  }
}

// --- Schemas (Kept for Type Safety & Fallbacks) ---
const trendSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    trends: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          viralityScore: { type: Type.INTEGER },
          category: { type: Type.STRING },
          soundName: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          exampleIdea: { type: Type.STRING },
          ugcExamples: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "description", "viralityScore", "category", "hashtags", "exampleIdea", "ugcExamples"]
      }
    }
  }
};

const videoScriptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    hook: { type: Type.STRING },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          visual: { type: Type.STRING },
          audio: { type: Type.STRING },
          duration: { type: Type.STRING }
        }
      }
    },
    cta: { type: Type.STRING }
  }
};

const contentPackageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    script: videoScriptSchema,
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    thumbnailText: { type: Type.STRING }
  }
};

const predictionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    predictions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          predictionScore: { type: Type.INTEGER },
          estimatedViews: { type: Type.STRING },
          momentum: { type: Type.STRING, enum: ["rising", "peaking", "stable"] },
          concepts: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    effortLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                    description: { type: Type.STRING },
                    hook: { type: Type.STRING },
                    audioSuggestion: { type: Type.STRING }
                }
             }
          }
        }
      }
    }
  }
};

const visualAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "0-100" },
    firstImpression: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    heatmapFocus: { 
        type: Type.ARRAY, 
        items: { 
            type: Type.OBJECT,
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
            }
        }
    },
    colorPsychology: { type: Type.STRING },
    ctrPrediction: { type: Type.STRING, enum: ["Low", "Medium", "High", "Viral"] }
  }
};

const getLangInstruction = (lang: Language) => {
    return lang === 'de' ? "IMPORTANT: Output content strictly in German." : "IMPORTANT: Output content strictly in English.";
}

export const isBackendConnected = () => USE_BACKEND;

// --- FUNCTIONS ---

export const fetchTrends = async (category: TrendCategory, lang: Language): Promise<Trend[]> => {
  if (USE_BACKEND) {
      try {
          console.log(`Connecting to backend: ${BACKEND_URL}/trends`);
          const res = await fetch(`${BACKEND_URL}/trends`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category, language: lang })
          });
          if (!res.ok) throw new Error(`Backend Error: ${res.statusText}`);
          const data = await res.json();
          return data.trends?.map((t: any, index: number) => ({ ...t, id: `trend-be-${index}` })) || [];
      } catch (e) {
          console.error("Backend/Render API fetch failed, falling back to client:", e);
      }
  }

  // Fallback: Client Side
  try {
    return await callWithRetry(async () => {
      const prompt = `Identify 6 ultra-current viral trends on TikTok for: "${category}". 
      Focus on what is happening THIS WEEK. 
      For each trend provide:
      - Name & Description
      - Virality Score (0-100)
      - Specific Sound/Audio Name
      - 5-7 Top Hashtags
      - A main creative concept idea ("exampleIdea")
      - 3 specific examples of User Generated Content (UGC) seen in this trend ("ugcExamples")
      ${getLangInstruction(lang)}`;

      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: trendSchema,
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      return parsed.trends?.map((t: any, index: number) => ({ ...t, id: `trend-${index}-${Date.now()}` })) || [];
    });
  } catch (error) {
    console.error("Error fetching trends (Final):", error);
    return []; 
  }
};

export const generateContentPackage = async (trendName: string, trendIdea: string, lang: Language): Promise<ContentPackage | null> => {
  if (USE_BACKEND) {
      try {
          const res = await fetch(`${BACKEND_URL}/generate-content`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trendName, trendIdea, language: lang })
          });
          if (!res.ok) throw new Error("Backend Error");
          return await res.json();
      } catch (e) { console.error("Backend content gen failed, falling back", e); }
  }

  try {
    return await callWithRetry(async () => {
      const prompt = `Create a complete "Viral Content Package" for TikTok based on the trend "${trendName}".
      Concept: ${trendIdea}.
      
      1. Script: Fast-paced, max 30s.
      2. Caption: Viral, engaging, asking for comments.
      3. Hashtags: 5-7 potent tags (mix of broad and niche).
      4. ThumbnailText: A clickbait text overlay (max 5 words) for the video cover.
      ${getLangInstruction(lang)}`;

      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: contentPackageSchema
        }
      });

      return JSON.parse(response.text || "null");
    });
  } catch (e) {
    console.error("Error generating content package (Final):", e);
    return null;
  }
};

export const generateVideoFootage = async (description: string): Promise<string | null> => {
    if (USE_BACKEND) {
        try {
            const res = await fetch(`${BACKEND_URL}/render-video`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });
            if (!res.ok) throw new Error("Backend Video Error");
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        } catch (e) {
            console.error("Backend Video Render Failed", e);
            return null;
        }
    }

    // Fallback Client Side (Google Veo direct)
    if (!window.aistudio?.hasSelectedApiKey) {
        console.warn("API Key selection required for Veo.");
        return null;
    }
    if (!await window.aistudio.hasSelectedApiKey()) {
        return null;
    }

    try {
        const prompt = `A high quality, 9:16 vertical video for TikTok. ${description}. Fast paced, engaging.`;
        const videoAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let operation = await videoAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '9:16'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); 
            operation = await videoAi.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        return URL.createObjectURL(blob);

    } catch (e) {
        console.error("Veo Video Gen failed:", e);
        return null;
    }
};

// --- Other Functions (Client-Side Wrappers or Direct Calls if Backend doesn't support yet) ---

export const generateVideoScript = async (trendName: string, trendIdea: string, lang: Language): Promise<VideoScript | null> => {
  try {
    return await callWithRetry(async () => {
      const prompt = `Write a viral TikTok script for the trend "${trendName}".
      Concept: ${trendIdea}.
      Keep it fast-paced, max 30s. Include a strong hook and call to action.
      ${getLangInstruction(lang)}`;

      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: videoScriptSchema }
      });

      return JSON.parse(response.text || "null");
    });
  } catch (e) { return null; }
};

export const rewriteScript = async (currentScript: VideoScript, modifier: ScriptModifier, lang: Language): Promise<VideoScript | null> => {
  try {
    return await callWithRetry(async () => {
      const prompt = `Rewrite the following TikTok script to be more "${modifier}".
      Original Title: ${currentScript.title}
      Original Hook: ${currentScript.hook}
      Maintain structure but change tone.
      ${getLangInstruction(lang)}`;

      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: videoScriptSchema }
      });
      return JSON.parse(response.text || "null");
    });
  } catch (e) { return null; }
};

export const generateThumbnailImage = async (description: string): Promise<string | null> => {
    try {
        return await callWithRetry(async () => {
            const prompt = `A high quality, photorealistic TikTok thumbnail background image representing: ${description}. 
            Bright colors, high contrast, 9:16 vertical aspect ratio, professional lighting, no text in the image.`;
            const response = await ai.models.generateImages({
                model: imageModel,
                prompt: prompt,
                config: { numberOfImages: 1, aspectRatio: "9:16", outputMimeType: "image/jpeg" }
            });
            return response.generatedImages?.[0]?.image?.imageBytes 
                ? `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}` 
                : null;
        }, 2);
    } catch (e) { return null; }
};

export const runViralPrediction = async (niche: string, lang: Language): Promise<ViralPrediction[]> => {
    try {
        return await callWithRetry(async () => {
            const prompt = `Act as a TikTok Algorithm Expert. Predict 3 breakout topics or trends for the niche "${niche}" that have high potential to go viral NEXT WEEK.
            For each prediction: 1. Explain WHY. 2. Assign predictionScore (0-100). 3. Generate 3 content concepts.
            ${getLangInstruction(lang)}`;

            const response = await ai.models.generateContent({
                model: textModel,
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: predictionSchema }
            });
            const parsed = JSON.parse(response.text || "{}");
            return parsed.predictions?.map((p: any, i: number) => ({ ...p, id: `pred-${i}-${Date.now()}` })) || [];
        });
    } catch (e) { return []; }
};

export const analyzeAccountProfile = async (username: string, additionalContext: string, lang: Language): Promise<AccountAnalysis | null> => {
  try {
    return await callWithRetry(async () => {
      const prompt = `Search for TikTok profile "${username}". Analyze web presence. Context: ${additionalContext}
      You MUST format response with markdown dividers. ${getLangInstruction(lang)}
      Structure: [METRICS]...[/METRICS] [SUMMARY]...[/SUMMARY] [SWOT]...[/SWOT] [STRATEGY]...[/STRATEGY]`;

      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      const text = response.text || "";
      const metricsMatch = text.match(/\[METRICS\]([\s\S]*?)\[\/METRICS\]/);
      const summaryMatch = text.match(/\[SUMMARY\]([\s\S]*?)\[\/SUMMARY\]/);
      const swotMatch = text.match(/\[SWOT\]([\s\S]*?)\[\/SWOT\]/);
      const strategyMatch = text.match(/\[STRATEGY\]([\s\S]*?)\[\/STRATEGY\]/);

      const metricsRaw = metricsMatch ? metricsMatch[1] : "";
      const swotRaw = swotMatch ? swotMatch[1] : "";
      const parseList = (section: string) => {
        const regex = new RegExp(`${section}:([\\s\\S]*?)(?=(?:STRENGTHS|WEAKNESSES|OPPORTUNITIES|THREATS):|$)`, 'i');
        const match = swotRaw.match(regex);
        if (!match) return [];
        return match[1].split('\n').map(l => l.replace(/^-\s*/, '').trim()).filter(l => l.length > 0);
      };

      const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
        .filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }))
        .filter((v: any, i: number, a: any[]) => a.findIndex(t => (t.uri === v.uri)) === i);

      return {
        username,
        profileSummary: summaryMatch ? summaryMatch[1].trim() : "N/A",
        metrics: {
            followers: metricsRaw.match(/Followers:\s*(.*)/i)?.[1]?.trim() || "N/A",
            niche: metricsRaw.match(/Niche:\s*(.*)/i)?.[1]?.trim() || "Unknown",
            engagement: metricsRaw.match(/Engagement:\s*(.*)/i)?.[1]?.trim() || "N/A",
        },
        swot: {
            strengths: parseList('STRENGTHS'),
            weaknesses: parseList('WEAKNESSES'),
            opportunities: parseList('OPPORTUNITIES'),
            threats: parseList('THREATS'),
        },
        strategy: strategyMatch ? strategyMatch[1].trim() : text,
        sources
      };
    });
  } catch (error) { return null; }
};

export const compareAccounts = async (user1: string, user2: string, lang: Language): Promise<CompetitorComparison | null> => {
    try {
        return await callWithRetry(async () => {
            const prompt = `Compare TikTok accounts "${user1}" and "${user2}". Determine winner.
            ${getLangInstruction(lang)} Respond ONLY with valid JSON matching structure.`;
            const response = await ai.models.generateContent({
                model: textModel,
                contents: prompt,
                config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" }
            });
            return JSON.parse(response.text || "null");
        });
    } catch (e) { return null; }
};

export const analyzeVisualContent = async (imageBase64: string, lang: Language): Promise<VisualAnalysis | null> => {
    try {
        return await callWithRetry(async () => {
            const prompt = `Analyze this image as a TikTok Thumbnail. Provide Score, First Impression, Heatmap coords, Color Psych, CTR Prediction. ${getLangInstruction(lang)}`;
            const response = await ai.models.generateContent({
                model: textModel,
                contents: [{ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(',')[1] } }, { text: prompt }],
                config: { responseMimeType: "application/json", responseSchema: visualAnalysisSchema }
            });
            return JSON.parse(response.text || "null");
        });
    } catch (e) { return null; }
};

export const sendChatMessage = async (history: ChatMessage[], message: string, lang: Language): Promise<string | null> => {
    try {
        return await callWithRetry(async () => {
            const historyForAi = history.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
            const chatAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const chat = chatAi.chats.create({
                model: chatModel,
                history: historyForAi,
                config: { systemInstruction: `You are an expert TikTok Strategist. ${getLangInstruction(lang)}` }
            });
            const result = await chat.sendMessage({ message: message });
            return result.text || null;
        });
    } catch (e) { return null; }
};