import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Part } from '@google/generative-ai';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { fileURLToPath } from 'url';
import PocketBase from 'pocketbase';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('GEMINI_API_KEY is not set in the .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Initialize PocketBase for the server
const pocketbaseUrl = process.env.VITE_POCKETBASE_URL;
if (!pocketbaseUrl) {
  console.error('VITE_POCKETBASE_URL is not set for the server.');
  process.exit(1);
}
const pb = new PocketBase(pocketbaseUrl);


// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a type for the quest entries
interface Quest {
  userId: string;
  problemId: string;
  totalScore: number;
  solution: any;
  timestamp: Date;
}

// In-memory store for completed quests
const completedQuests: Quest[] = [];

app.post('/api/gemini-chat', async (req: express.Request, res: express.Response) => {
  const { name, role, backstory, question } = req.body;

  if (!name || !role || !backstory || !question) {
    return res.status(400).json({ error: 'Missing persona details or question.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Using Gemini model for chat:', 'gemini-1.5-flash');

    const prompt = `Respond as ${name} (${role}) with backstory: ${backstory} to this question: ${question}. Please ensure your response is in B1 (Intermediate) level English: simple, clear, using basic grammar and vocabulary, avoiding idioms, and limited to 2-3 sentences. keep it concise`;
    const result = await model.generateContentStream(prompt);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }
    res.end();

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error calling Gemini API:', err);
    res.status(500).json({ error: 'Failed to get response from AI. Please try again later.', details: err.message });
  }
});

app.post('/api/gemini-score', upload.array('files', 5), async (req: express.Request, res: express.Response) => {
  console.log('Server: Received /api/gemini-score request with body:', req.body);
  console.log('Server: Received files:', req.files);

  const { stage, selectedIdea, posterNotes, timelineNotes, prompt: initialPrompt } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!stage) {
    return res.status(400).json({ error: 'Missing stage information.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Using Gemini model for scoring:', 'gemini-1.5-flash');

    let prompt = '';

    if (stage === 'prototype') {
      if (!selectedIdea || !posterNotes || !timelineNotes || !initialPrompt) {
        return res.status(400).json({ error: 'Missing selectedIdea, posterNotes, timelineNotes, or prompt for Prototype stage.' });
      }

      prompt = `Analyze the following Concept Poster submission for the Prototype stage in design thinking...`; // Truncated for brevity

      const modelParts: Part[] = [{ text: prompt }];

      for (const file of files) {
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType) {
            console.warn(`Could not determine file type for ${file.originalname}. Skipping.`);
            continue;
        }
        const mimeType = fileType.mime;
        const base64Data = file.buffer.toString('base64');
        modelParts.push({
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        });
      }

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: modelParts }]
      });
      const response = await result.response;
      const text = response.text();

      let parsedResponse;
      try {
        let jsonString = text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        } else {
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = text.substring(firstBrace, lastBrace + 1);
          }
        }
        parsedResponse = JSON.parse(jsonString);
      } catch (parseError: unknown) {
        console.error('Error parsing Gemini score response as JSON:', parseError);
        return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });
      }

      if (typeof parsedResponse.score !== 'number' ||
          typeof parsedResponse.strengths !== 'string' ||
          typeof parsedResponse.improvements !== 'string' ||
          !Array.isArray(parsedResponse.suggestions) ||
          typeof parsedResponse.overallComment !== 'string') {
        console.error('AI response in unexpected format:', parsedResponse);
        return res.status(500).json({
          error: 'AI response in unexpected format. Providing fallback score.',
          score: 50,
          strengths: 'N/A',
          improvements: 'Could not parse detailed feedback.',
          suggestions: ['Ensure your input is clear and concise.'],
          overallComment: 'Please try again.'
        });
      }
      res.json(parsedResponse);

    } else if (stage === 'empathy') {
        const { empathyMapInput, reflection, insights, themes, selectedProblem } = req.body;
      if (!empathyMapInput || !reflection || !insights || !themes) {
        return res.status(400).json({ error: 'Missing empathy map input, reflection, insights, or themes for Empathy stage.' });
      }

      const insightsString = insights.map((i: any) => `Persona: ${i.persona}, Activity: ${i.activity}, Because: ${i.because}, But: ${i.but}`).join('\n');
      const themesString = themes.join('\n');
      prompt = `Analyze the following user inputs for the Empathize stage...`; // Truncated
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      let parsedResponse;
      try {
        let jsonString = text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonString = text.substring(firstBrace, lastBrace + 1);
            }
        }
        parsedResponse = JSON.parse(jsonString);
    } catch (parseError: unknown) {
        console.error('Error parsing Gemini score response as JSON:', parseError);
        return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });
    }
    if (typeof parsedResponse.score !== 'number' || typeof parsedResponse.strengths !== 'string' || typeof parsedResponse.improvements !== 'string' || !Array.isArray(parsedResponse.suggestions) || typeof parsedResponse.overallComment !== 'string') {
        console.error('AI response in unexpected format:', parsedResponse);
        return res.status(500).json({ error: 'AI response in unexpected format. Providing fallback score.', score: 50, strengths: 'N/A', improvements: 'Could not parse detailed feedback.', suggestions: ['Ensure your input is clear and concise.'], overallComment: 'Please try again.' });
    }
    res.json(parsedResponse);

    } else if (stage === 'ideate') {
        const { hmw, selectedTop3Ideas, rationaleMap, reflection, selectedProblem } = req.body;
      if (!hmw || !selectedTop3Ideas || !rationaleMap || !reflection || !selectedProblem) {
        return res.status(400).json({ error: 'Missing HMW, selected top 3 ideas, rationale map, reflection, or selected problem for Ideate stage.' });
      }
      const ideasString = JSON.parse(selectedTop3Ideas).map((idea: any) => {
        const rationale = JSON.parse(rationaleMap)[idea] || 'No rationale provided.';
        return `- Idea: "${idea}"\n  Rationale: "${rationale}"`;
      }).join('\n');
      prompt = `Analyze the following Ideate stage submission...`; // Truncated
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      let parsedResponse;
      try {
        let jsonString = text;
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        } else {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                jsonString = text.substring(firstBrace, lastBrace + 1);
            }
        }
        parsedResponse = JSON.parse(jsonString);
    } catch (parseError: unknown) {
        console.error('Error parsing Gemini score response as JSON:', parseError);
        return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });
    }
    if (typeof parsedResponse.score !== 'number' || typeof parsedResponse.strengths !== 'string' || typeof parsedResponse.improvements !== 'string' || !Array.isArray(parsedResponse.suggestions) || typeof parsedResponse.overallComment !== 'string') {
        console.error('AI response in unexpected format:', parsedResponse);
        return res.status(500).json({ error: 'AI response in unexpected format. Providing fallback score.', score: 50, strengths: 'N/A', improvements: 'Could not parse detailed feedback.', suggestions: ['Ensure your input is clear and concise.'], overallComment: 'Please try again.' });
    }
    res.json(parsedResponse);

    } else if (stage === 'define') {
        const { hmwList, selectedProblem, themes, reflection } = req.body;
        if (!hmwList || hmwList.length === 0 || !selectedProblem || !themes || themes.length === 0 || !reflection) {
            return res.status(400).json({ error: 'Missing HMW list, selected problem, themes, or reflection for Define stage.' });
        }
        const hmwListString = JSON.parse(hmwList).map((hmw: any) => `- ${hmw}`).join('\n');
        const themesString = JSON.parse(themes).map((theme: any) => `- ${theme.title}: ${theme.description}`).join('\n');
        prompt = `Analyze the following Define stage submission...`; // Truncated
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        let parsedResponse;
        try {
            let jsonString = text;
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1];
            } else {
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonString = text.substring(firstBrace, lastBrace + 1);
                }
            }
            parsedResponse = JSON.parse(jsonString);
        } catch (parseError: unknown) {
            console.error('Error parsing Gemini score response as JSON:', parseError);
            return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });
        }
        if (typeof parsedResponse.score !== 'number' || typeof parsedResponse.strengths !== 'string' || typeof parsedResponse.improvements !== 'string' || !Array.isArray(parsedResponse.suggestions) || typeof parsedResponse.overallComment !== 'string') {
            console.error('AI response in unexpected format:', parsedResponse);
            return res.status(500).json({ error: 'AI response in unexpected format...', score: 50, strengths: 'N/A', improvements: 'Could not parse detailed feedback.', suggestions: ['Ensure your input is clear and concise.'], overallComment: 'Please try again.' });
        }
        res.json(parsedResponse);
    } else {
        return res.status(400).json({ error: 'Invalid stage provided.' });
    }
  } catch (error: unknown) {
      const err = error as Error;
      console.error('Error calling Gemini API for scoring:', err.message);
      console.error('Error stack:', err.stack);
      res.status(500).json({ error: 'Failed to get score from AI...', details: err.message, score: 50, strengths: 'N/A', improvements: 'Failed to connect to AI service.', suggestions: ['Check your internet connection or try again later.'], overallComment: 'An error occurred.' });
  }
});

app.post('/api/gemini-score-prototype', async (req: express.Request, res: express.Response) => {
    console.log('Server: Received /api/gemini-score-prototype request with body:', req.body);
    const { selectedIdea, poster, uploads } = req.body;

    if (!selectedIdea || !poster) {
        return res.status(400).json({ error: 'Missing selected idea or poster content.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('Using Gemini model for prototype scoring:', 'gemini-1.5-flash');

        const modelParts: Part[] = [
            { text: `You are a Design Thinking expert. Analyze this Concept Poster (text provided) and the attached wireframes/prototype visuals.
              The selected idea is: "${selectedIdea}"
              The concept poster content is:
              ${poster}
              ${uploads && uploads.length > 0 ? `The user has also provided ${uploads.length} uploaded files (images/PDFs) as part of their prototype.` : ''}
      
              Now analyze these prototype visuals:
              Give specific feedback for each visual, indicating whether it's a strength (positive) or an area for improvement (negative).
              For example:
              "visualFeedback": [
                { "quote": "The mobile app flow is intuitive with clear navigation.", "sentiment": "positive" },
                { "quote": "The physical cart design needs clearer labeling on buttons.", "sentiment": "negative" }
              ]
      
              Score 0-100. Check the following criteria:
              1. Does it clearly address the selected problem and HMW questions?
              2. Is the solution feasible and creative?
              3. Are visuals clear and relevant? Penalize if no uploads for software solutions.
      
              Give honest, strict feedback — only award 90+ if the prototype is excellent and clearly solves the problem.
      
              Your response MUST be a JSON object with the following properties: 'score' (number), 'strengths' (string), 'improvements' (string), 'suggestions' (array of strings), 'overallComment' (string), 'addressesProblem' (boolean), and 'visualFeedback' (array of objects with 'quote' and 'sentiment' properties).`
            }
        ];

        if (uploads && Array.isArray(uploads)) {
            uploads.forEach((upload: { name: string; base64: string; type: string }) => {
                const base64Content = upload.base64.split(',')[1];
                if (base64Content) {
                    modelParts.push({
                        inlineData: {
                            data: base64Content,
                            mimeType: upload.type,
                        },
                    });
                }
            });
        }

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: modelParts }]
        });
        const response = await result.response;
        const text = response.text();

        let parsedResponse;
        try {
            let jsonString = text;
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
                jsonString = jsonMatch[1];
            } else {
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonString = text.substring(firstBrace, lastBrace + 1);
                }
            }
            parsedResponse = JSON.parse(jsonString);
        } catch (parseError: unknown) {
            console.error('Error parsing Gemini prototype score response as JSON:', parseError);
            return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });
        }

        if (typeof parsedResponse.score !== 'number' ||
            typeof parsedResponse.strengths !== 'string' ||
            typeof parsedResponse.improvements !== 'string' ||
            !Array.isArray(parsedResponse.suggestions) ||
            typeof parsedResponse.overallComment !== 'string' ||
            typeof parsedResponse.addressesProblem !== 'boolean') {
            console.error('AI response in unexpected format:', parsedResponse);
            return res.status(500).json({
                error: 'AI response in unexpected format. Providing fallback score.',
                score: 50,
                strengths: 'N/A',
                improvements: 'Could not parse detailed feedback.',
                suggestions: ['Ensure your input is clear and concise.'],
                overallComment: 'Please try again.',
                addressesProblem: false,
            });
        }

        res.json(parsedResponse);

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error calling Gemini API for prototype scoring:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            error: 'Failed to get score from AI. Please try again later.',
            details: err.message,
            score: 50,
            strengths: 'N/A',
            improvements: 'Failed to connect to AI service.',
            suggestions: ['Check your internet connection or try again later.'],
            overallComment: 'An error occurred.',
            addressesProblem: false,
        });
    }
});

app.post('/api/gemini-persona', async (req: express.Request, res: express.Response) => {
    console.log('Server: Received /api/gemini-persona request with body:', req.body);
    const { persona, prototypeData, problemTitle } = req.body; 

    if (!persona || !prototypeData || !problemTitle) { 
        return res.status(400).json({ error: 'Missing persona, prototype data, or problem title.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 
        console.log('Using Gemini model for persona feedback:', 'gemini-1.5-flash');

        const { posterNotes, timelineNotes } = prototypeData;

        const posterNotesString = Object.entries(posterNotes)
            .map(([boxId, notes]: [string, any]) => `  ${boxId}: ${notes.join(', ')}`)
            .join('\n');

        const timelineNotesString = Object.entries(timelineNotes)
            .map(([weekId, notes]: [string, any]) => `  ${weekId}: ${notes.join(', ')}`)
            .join('\n');

        const prompt = `You are ${persona.name}, a ${persona.role} in SA. This prototype tries to solve ${problemTitle}. Here are the notes:
${posterNotesString}
${timelineNotesString}
Reply in 4-7 simple B1 sentences: what you like, one worry, one idea.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ feedback: text });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error calling Gemini API for persona feedback:', err.message);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            error: 'Failed to get persona feedback from AI. Please try again later.',
            details: err.message,
        });
    }
});

app.post('/api/complete-quest', async (req: express.Request, res: express.Response) => {
    console.log('Server: Received /api/complete-quest request with body:', req.body);
    const { userId, problemId, totalScore, solution } = req.body;

    if (totalScore === undefined || !problemId || !userId || !solution) { 
        return res.status(400).json({ error: 'Missing totalScore, problemId, userId, or solution.' });
    }

    const newQuestEntry: Quest = { userId, problemId, totalScore, solution, timestamp: new Date() };
    completedQuests.push(newQuestEntry);
    console.log('Completed quests:', completedQuests);

    const rank = Math.round((totalScore / 500) * 100); 
    const baseReward = 100; 
    const reward = baseReward * 2; 
    const badge = 'Innovator';

    console.log(`Quest completed by user ${userId} for problem ${problemId} with score ${totalScore}. Rank: ${rank}, Reward: ${reward}, Badge: ${badge}`);

    res.json({ rank, reward, badge, message: 'Quest completed successfully!' });
});

app.get('/api/leaderboard', async (req: express.Request, res: express.Response) => {
    const { problemId } = req.query;
    if (!problemId) {
        return res.status(400).json({ error: 'Missing problemId query parameter.' });
    }
    let leaderboardEntries = completedQuests
        .filter(quest => String(quest.problemId) === String(problemId))
        .map(quest => ({
            userId: quest.userId,
            username: quest.userId,
            avatar: 'https://models.readyplayer.me/690dd5c4672cca15c22548fe.glb',
            problemTitle: 'Problem ' + quest.problemId,
            solution: quest.solution,
            totalScore: quest.totalScore,
        }));
    leaderboardEntries.sort((a, b) => b.totalScore - a.totalScore);
    leaderboardEntries = leaderboardEntries.map((entry, index) => ({ ...entry, rank: index + 1 }));
    res.json(leaderboardEntries);
});

app.get('/api/rpm-avatar-proxy', async (req: express.Request, res: express.Response) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Missing URL query parameter.' });
    }
    try {
        const response = await axios.get(url as string, { responseType: 'arraybuffer' });
        res.setHeader('Content-Type', 'model/gltf-binary');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Length', response.data.length);
        res.send(response.data);
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error proxying RPM avatar:', err.message);
        res.status(500).json({ error: 'Failed to proxy avatar. Please try again later.' });
    }
});

app.post('/api/update-avatar', async (req: express.Request, res: express.Response) => {
    const { userId, avatarUrl } = req.body;
    if (!userId || !avatarUrl) {
        return res.status(400).json({ error: 'Missing userId or avatarUrl in request body.' });
    }
    try {
        await pb.collection('users').update(userId, { avatarUrl });
        return res.status(200).json({ message: 'Avatar updated successfully.' });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error updating avatar:', err);
        return res.status(500).json({ error: 'Failed to update avatar.', details: err.message });
    }
});

// The "catchall" handler
app.get('/*', (req: express.Request, res: express.Response) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});