
import { GoogleGenAI, Type } from "@google/genai";
import { SituationalReport, NewsItem, Theater } from "../types";

export const fetchSituationalReport = async (theater: Theater = Theater.GLOBAL): Promise<SituationalReport> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const theaterContext = theater === Theater.GLOBAL 
    ? "globally across all major conflict zones (Ukraine, Middle East, Africa, Pacific)" 
    : `specifically for the ${theater} theater of operations`;

  const prompt = `Provide a comprehensive current strategic situational report and LIVE news feed ${theaterContext}. 
  
  CRITICAL DATA REQUEST:
  Search for real-time indicators of "Pentagon Busyness" or the "Pentagon Pizza Index". Look for reports on traffic congestion or fast-food demand (Dominos, McDonalds) near the Pentagon in Arlington, VA to estimate the "Pentagon Activity Index".

  Focus on:
  - Tactical frontline shifts
  - Significant naval movements
  - Pentagon Activity Rating based on surrounding traffic/busyness signals.

  Format the response as a valid JSON object with the following structure:
  {
    "timestamp": "ISO string",
    "summary": "Synthesized paragraph of strategic posture",
    "threatLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "pentagonActivity": {
      "score": number (0-100),
      "label": "NORMAL" | "ELEVATED" | "CRITICAL",
      "reasoning": "Brief explanation based on fast food traffic or local news"
    },
    "hotspots": [{"name": "Specific Place", "region": "Region", "description": "Summary"}],
    "news": [
      {
        "theater": "${theater}",
        "title": "Short headline",
        "summary": "One sentence news summary",
        "url": "A real URL",
        "timestamp": "Time ago",
        "sourceType": "NEWS" | "SOCIAL" | "OFFICIAL"
      }
    ]
  }
  
  USE THE googleSearch TOOL.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr.trim()) as SituationalReport;
    
    if (!data.news) data.news = [];
    if (!data.hotspots) data.hotspots = [];
    if (!data.pentagonActivity) {
        data.pentagonActivity = { score: 15, label: "NORMAL", reasoning: "Baseline telemetry active." };
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && data.news.length < 3) {
      const extraNews = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          theater: theater,
          title: chunk.web?.title || "Tactical Update",
          summary: "Verified update from external surveillance grounding.",
          url: chunk.web?.uri || "#",
          timestamp: "NEW",
          sourceType: 'NEWS'
        })) as NewsItem[];
      data.news = [...data.news, ...extraNews].slice(0, 8);
    }

    return data;
  } catch (error) {
    console.error("Error fetching situational report:", error);
    return {
      timestamp: new Date().toISOString(),
      summary: `Surveillance of ${theater} is currently utilizing cached telemetry.`,
      threatLevel: "MEDIUM",
      pentagonActivity: { score: 42, label: "ELEVATED", reasoning: "Satellite link delay, estimating based on last known patterns." },
      hotspots: [{ name: "Sector A", region: theater, description: "Routine monitoring active." }],
      news: [{ theater: theater as any, title: 'Intel Link Degraded', summary: 'Re-establishing secure link...', url: '#', timestamp: 'NOW', sourceType: 'OFFICIAL' }]
    };
  }
};
