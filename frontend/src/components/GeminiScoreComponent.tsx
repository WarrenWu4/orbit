import { GoogleGenerativeAI } from "@google/generative-ai";
import "../index.css";

interface GeminiScoreProps {
    danceData: number[][]
}

export const generateContent = async ({ danceData }: GeminiScoreProps) => {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Access environment variable in Vite
        if (!apiKey) {
            throw new Error("API key is missing.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = await genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        const prompt = `You are assisting a student learning a dance, using a pose landmark detection 
            algorithm to compare two vectors for angular differences. The data consists of differences 
            between the student’s movements and a reference video (ground truth). Each timestamp (sampled 
            every 5 seconds) includes 12 angles corresponding to body part pairs in a fixed order: left 
            wrist-elbow, left elbow-shoulder, shoulder-shoulder, right elbow-shoulder, right wrist-elbow, left 
            torso, right torso, hips, left hip-knee, right hip-knee, left knee-feet, and right knee-feet. 
            Your goal is to interpret these angles, identify outliers, and suggest improvements to the 
            student’s movements in an encouraging, concise, teacher-like tone without discussing the data itself.
            A good sentence would be 'Focus on keeping your torso steady through transitions. There was a large 
            deviation at near... compared to the reference model' Don't give every 5 second interval updates simply state the issues
            The reponse can be in the form of markdown the title is not needed but small description is. Then,
            go into the student's improvements. Be sure to format it well with bullet points, indents, bolds, numbers.

            Below is yor data ${danceData}
            `;

        const result = await model.generateContent(prompt);

        console.log("API Response:", result);
        return result.response?.text() || "No response text available";
    } catch (error) {
        console.error("Error calling the Gemini API:", error);
        return "Error generating content"
    }
};

