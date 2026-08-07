import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, contextType } = req.body;
  if (!input) {
    return res.status(400).json({ error: 'Input text is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // MOCK RESPONSE
    let enhancedText = '';
    if (contextType === 'summary') {
      enhancedText = `Dynamic and results-oriented professional with a proven track record of optimizing ${input}. Adept at leveraging innovative strategies to drive measurable business outcomes.`;
    } else {
      enhancedText = `Spearheaded initiatives resulting in significant improvements. Successfully executed ${input}, driving a 20% increase in efficiency.`;
    }
    return res.status(200).json({ enhancedText });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert resume writer. Enhance the following resume ${contextType} to be more professional, impactful, and concise. Do not include any introductory or concluding text, just the enhanced content.\n\nOriginal:\n${input}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    return res.status(200).json({ enhancedText: text });
  } catch (error) {
    console.error("AI Enhance Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
