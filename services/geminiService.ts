
import { GoogleGenAI } from "@google/genai";
import { SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchLocations = async (
  query: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<{ text: string; results: SearchResult[]; sources: any[] }> => {
  const modelName = 'gemini-2.5-flash';
  
  const prompt = `Search for the location: "${query}". 
  Please provide the specific details for the best match. 
  IMPORTANT: You MUST include the coordinates in this exact format in your response: [LAT: numerical_latitude, LNG: numerical_longitude].
  Example: [LAT: 48.8566, LNG: 2.3522]
  Also provide the full address and name of the place.`;

  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (userLocation) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config,
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Parse the text for coordinates [LAT: X, LNG: Y]
    const latMatch = text.match(/\[LAT:\s*(-?\d+\.?\d*)/);
    const lngMatch = text.match(/LNG:\s*(-?\d+\.?\d*)\]/);
    
    // Attempt to find place name and address from text if grounding is sparse
    // Usually groundingChunks will have maps data
    const results: SearchResult[] = [];
    
    if (latMatch && lngMatch) {
      const lat = parseFloat(latMatch[1]);
      const lng = parseFloat(lngMatch[1]);
      
      // Look for a maps link in grounding
      const mapsChunk = groundingChunks.find((c: any) => c.maps?.uri);
      const mapsUrl = mapsChunk?.maps?.uri || "";
      const name = mapsChunk?.maps?.title || query;

      results.push({
        name,
        address: text.split('\n')[0].substring(0, 100), // Fallback address
        lat,
        lng,
        mapsUrl
      });
    }

    return {
      text,
      results,
      sources: groundingChunks
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};
