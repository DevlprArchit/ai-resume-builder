import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeData } = req.body;
  if (!resumeData) {
    return res.status(400).json({ error: 'Resume data is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // MOCK RESPONSE
    return res.status(200).json({
      score: 75,
      missingKeywords: ["React", "Node.js", "Agile", "REST APIs", "GraphQL"],
      suggestions: [
        "Add more quantifiable results to your work experience.",
        "Include relevant keywords like React and Node.js if applicable.",
        "Ensure your summary highlights your most impactful achievements."
      ]
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert ATS (Applicant Tracking System) software. Analyze the following resume data and provide an ATS score out of 100, a list of missing keywords, and specific suggestions for improvement. Return ONLY a JSON object with this structure: {"score": number, "missingKeywords": string[], "suggestions": string[]}. Do not include markdown formatting.\n\nResume Data:\n${JSON.stringify(resumeData)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON string using a regex to handle markdown wrappers or extraneous text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response.");
    }
    
    const data = JSON.parse(jsonMatch[0]);
    return res.status(200).json(data);
  } catch (error) {
    console.error("ATS Scan Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
