import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../index.css";

interface GeminiContentComponentProps {
  danceName: string;
}

const GeminiContentComponent: React.FC<GeminiContentComponentProps> = ({
  danceName,
}) => {
  const [responseText, setResponseText] = useState<string>("");

  useEffect(() => {
    if (danceName.trim()) {
      generateContent();
    }
  }, [danceName]);

  const generateContent = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Access environment variable in Vite
      if (!apiKey) {
        throw new Error("API key is missing.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `LIMIT TO ONE TO TWO PARAGRAPHS. Provide detailed information about the cultural and historical significance, origins, and importance of the traditional dance known as '${danceName}', formatted in basic paragraph text without bold formatting.`;

      const result = await model.generateContent(prompt);

      console.log("API Response:", result);
      setResponseText(result.response?.text() || "No response text available");
    } catch (error) {
      console.error("Error calling the Gemini API:", error);
      setResponseText("Error generating content");
    }
  };

  return (
    <div className="bg-purple-100 border-2 border-blue-200 p-6 rounded-lg mx-auto my-6 text-center neon-blue-shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Information About: {danceName}
      </h2>
      <p className="whitespace-pre-wrap text-gray-800 text-lg leading-relaxed">
        {responseText}
      </p>
    </div>
  );
};

export default GeminiContentComponent;
