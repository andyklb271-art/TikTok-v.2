
export type Language = 'de' | 'en';

export interface Trend {
  id: string;
  name: string;
  description: string;
  viralityScore: number; // 0-100
  category: string;
  soundName?: string;
  hashtags: string[];
  exampleIdea: string;
  ugcExamples: string[];
}

export interface VideoScript {
  title: string;
  hook: string;
  scenes: {
    visual: string;
    audio: string;
    duration: string;
  }[];
  cta: string;
}

export type ScriptModifier = 'funny' | 'genz' | 'controversial' | 'professional' | 'shorter';

export interface AccountAnalysis {
  username: string;
  profileSummary: string; // Kurzbeschreibung
  metrics: {
    followers: string; // "1.2M" (geschätzt via Search)
    engagement: string; // "High" / "Medium"
    niche: string;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  strategy: string; // Markdown Text
  sources: {
    title: string;
    uri: string;
  }[];
}

export interface CompetitorComparison {
  winner: string;
  winnerReason: string;
  user1: {
    username: string;
    score: number;
    strength: string;
  };
  user2: {
    username: string;
    score: number;
    strength: string;
  };
  comparisonPoints: {
    metric: string;
    user1Value: string;
    user2Value: string;
    advantage: 'user1' | 'user2' | 'equal';
  }[];
  tacticalAdvice: string; // Markdown
}

export interface ViralPrediction {
  id: string;
  topic: string;
  reasoning: string;
  predictionScore: number; // 0-100 probability
  estimatedViews: string; // e.g. "50k - 200k"
  momentum: 'rising' | 'peaking' | 'stable';
  concepts?: ViralConcept[];
}

export interface ViralConcept {
  title: string;
  effortLevel: 'Low' | 'Medium' | 'High';
  description: string;
  hook: string;
  audioSuggestion: string;
}

export interface ContentPackage {
  script: VideoScript;
  caption: string;
  hashtags: string[];
  thumbnailText: string;
  generatedImage?: string; // Base64
  generatedVideo?: string; // Uri
}

export interface VisualAnalysis {
  score: number; // 0-100
  firstImpression: string;
  strengths: string[];
  improvements: string[];
  heatmapFocus: { x: number; y: number }[]; // Simulated focus points
  colorPsychology: string;
  ctrPrediction: 'Low' | 'Medium' | 'High' | 'Viral';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp?: number;
}

export enum TrendCategory {
  GENERAL = 'Allgemein & Viral',
  DANCE = 'Tanz & Musik',
  TECH = 'Technik & AI',
  BUSINESS = 'Business & Finanzen',
  COMEDY = 'Comedy & Skits',
  EDUCATION = 'Wissen & Tipps',
  LIFESTYLE = 'Lifestyle & Vlog'
}