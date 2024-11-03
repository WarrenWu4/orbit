import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "../index.css"; // Ensure you have custom styles if needed
import bananaGif from "../../public/banana.gif"; // Adjust the path as needed

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
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = await genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `LIMIT TO ONE PARAGRAPHS. DO NOT ASK FOR MORE CONTEXT AND DONT SAY ANYING ALONG THE LINES OF "DANCE DOES NOT REFER TO A DANCE IN HISTORY" JUST GIVE ME INFO. Provide detailed information about '${danceName}' dance, formatted in basic paragraph text without bold formatting.`;

      const result = await model.generateContent(prompt);

      console.log("API Response:", result);
      setResponseText(result.response?.text() || "No response text available");
    } catch (error) {
      console.error("Error calling the Gemini API:", error);
      setResponseText("Error generating content");
    }
  };

  return (
    <div className="bg-black border-4 border-neon-blue p-6 rounded-lg mx-auto my-6 text-center relative shadow-neon-blue">
      <div className="flex justify-between mb-4">
        <span className="text-neon-pink text-3xl">🕹️</span>
        <span className="text-neon-green text-3xl">★</span>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-neon-blue uppercase tracking-wider">
        Information About: {danceName}
      </h2>
      <div className="flex items-center justify-between">
        <p className="text-left whitespace-pre-wrap text-white text-lg leading-relaxed flex-1 mr-4">
          {responseText}
        </p>
        <img src={bananaGif} alt="Banana GIF" className="w-1/4 h-auto" />
      </div>
      <div className="flex justify-between mt-4">
        <span className="text-neon-yellow text-3xl">🎵</span>
        <span className="text-neon-purple text-3xl">💎</span>
      </div>
    </div>
  );
};

export default GeminiContentComponent;
