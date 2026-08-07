const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");

admin.initializeApp();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ----------------------------------------------------------------------
// AI Endpoints
// ----------------------------------------------------------------------

exports.enhanceContent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { input, contextType } = data;
  if (!input) {
    throw new functions.https.HttpsError("invalid-argument", "Input text is required");
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
    return { enhancedText };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert resume writer. Enhance the following resume ${contextType} to be more professional, impactful, and concise. Do not include any introductory or concluding text, just the enhanced content.\n\nOriginal:\n${input}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    return { enhancedText: text };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.checkATS = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in.");
  }

  const { resumeData } = data;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    // MOCK ATS RESPONSE
    return {
      score: 78,
      missingKeywords: ['Agile', 'Docker', 'Kubernetes'],
      suggestions: [
        'Add more quantifiable metrics to your recent experience.',
        'Include specific cloud technologies mentioned in the job description.'
      ]
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an ATS (Applicant Tracking System) expert. Review this resume data and return a JSON object containing: "score" (a number from 0 to 100), "missingKeywords" (an array of strings of important keywords missing), and "suggestions" (an array of strings of actionable suggestions to improve the resume).\n\nResume Data:\n${JSON.stringify(resumeData)}\n\nOnly return valid JSON without any markdown formatting.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const atsResult = JSON.parse(text);
    return {
      score: atsResult.score || 62,
      missingKeywords: atsResult.missingKeywords || [],
      suggestions: atsResult.suggestions || []
    };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ----------------------------------------------------------------------
// Export Endpoints
// Note: We use onRequest here because we need to return binary files (PDF/DOCX)
// which is easier via standard HTTP endpoints than onCall.
// ----------------------------------------------------------------------

const cors = require('cors')({ origin: true });

exports.exportPdf = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // In a real app, you'd verify the Firebase ID Token from req.headers.authorization here
      const resumeId = req.query.id;
      if (!resumeId) return res.status(400).send('Resume ID required');

      // Fetch resume from Firestore
      const doc = await admin.firestore().collection('resumes').doc(resumeId).get();
      if (!doc.exists) return res.status(404).send('Resume not found');
      
      const resume = doc.data();

      // HTML generation logic (simplified)
      const html = `
        <!DOCTYPE html>
        <html>
        <head><style>body { font-family: sans-serif; }</style></head>
        <body>
          <h1>${resume.personalInfo?.name || 'Untitled'}</h1>
          <p>${resume.summary || ''}</p>
        </body>
        </html>
      `;

      const browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setContent(html);
      
      const pdf = await page.pdf({ format: 'A4' });
      await browser.close();

      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.title}.pdf"`);
      res.send(pdf);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
});

exports.exportDocx = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const resumeId = req.query.id;
      if (!resumeId) return res.status(400).send('Resume ID required');

      const docSnapshot = await admin.firestore().collection('resumes').doc(resumeId).get();
      if (!docSnapshot.exists) return res.status(404).send('Resume not found');
      
      const resume = docSnapshot.data();

      const docx = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: resume.personalInfo?.name || 'Untitled',
              heading: HeadingLevel.HEADING_1,
            })
          ],
        }],
      });

      const buffer = await Packer.toBuffer(docx);
      
      res.contentType('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.title}.docx"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
});
