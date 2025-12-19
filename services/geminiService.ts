
import { GoogleGenAI, Type } from "@google/genai";
import { PlaneAnalysis } from "../types";

export const analyzePlaneImage = async (base64Image: string): Promise<PlaneAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: "Analyze this image. If there is a plane in the sky, identify its potential airline based on livery, aircraft type, and colors. Provide a brief interesting fact about this specific model or airline. Return the result in the specified JSON format."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPlane: { type: Type.BOOLEAN, description: "True if a plane is detected in the image." },
            airline: { type: Type.STRING, description: "Identified airline name (e.g., Lufthansa, Emirates)." },
            aircraftType: { type: Type.STRING, description: "Identified aircraft model (e.g., Airbus A320, Boeing 747)." },
            liveryDescription: { type: Type.STRING, description: "Short description of the visual identity/livery." },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." },
            interestingFact: { type: Type.STRING, description: "A trivia fact about this plane or airline." }
          },
          required: ["isPlane", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini Analysis failed:', error);
    return { isPlane: false, confidence: 0 };
  }
};
