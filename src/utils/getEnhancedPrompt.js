import "dotenv/config"
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export default async function getEnhancedPrompt(prompt) {


  const enchanedPromptLine = `Write a single best enhanced prompt for \"${prompt}\" that is to be passed to another model of image generation and respond with just the string of enhanced promptt`

  try {
    const result = await model.generateContent(enchanedPromptLine);
    const enchanedPrompt = result.response.text()

    if (!enchanedPrompt) return prompt;

    return enchanedPrompt

  } catch (error) {
    return prompt
  }
}