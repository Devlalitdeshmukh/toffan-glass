
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartQuotation = async (inquiryDetails: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sales assistant for Toffan Glass Solutions. Analyze this customer inquiry and provide a professional, helpful response including estimated requirements or product suggestions: "${inquiryDetails}"`,
      config: {
        systemInstruction: "You are an expert in glass and hardware architecture. Keep responses concise and sales-driven.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "Thank you for your inquiry. Our sales representative will contact you shortly with a detailed quote.";
  }
};

export const generateProductDescription = async (productName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a marketing description for a premium hardware product: ${productName}. Focus on durability, aesthetics, and MP weather conditions.`,
  });
  return response.text;
};
