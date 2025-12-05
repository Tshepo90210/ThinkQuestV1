import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';
import axios from 'axios';
import multer from 'multer'; // Import multer
import { fileTypeFromBuffer } from 'file-type'; // Import file-type
import path from 'path';
import { fileURLToPath } from 'url';

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

const geminiApiKey = process.env.GEMINI_API_KEY; // Use VITE_ prefix for frontend
if (!geminiApiKey) {
  console.error('VITE_GEMINI_API_KEY is not set in the .env file.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// In-memory store for completed quests (replace with a database in a real app)
const completedQuests = [];

app.post('/api/gemini-chat', async (req, res) => {
  const { name, role, backstory, question } = req.body;

  if (!name || !role || !backstory || !question) {
    return res.status(400).json({ error: 'Missing persona details or question.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Using Gemini model for chat:', 'gemini-2.0-flash');

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

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI. Please try again later.', details: error.message });
  }
});

// Modified /api/gemini-score to handle file uploads
app.post('/api/gemini-score', upload.array('files', 5), async (req, res) => {
  console.log('Server: Received /api/gemini-score request with body:', req.body);
  console.log('Server: Received files:', req.files);

  const { stage, selectedIdea, posterNotes, timelineNotes, prompt: initialPrompt } = req.body;
  const files = req.files as Express.Multer.File[];

  if (!stage) {
    return res.status(400).json({ error: 'Missing stage information.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Using Gemini model for scoring:', 'gemini-2.0-flash');

    let prompt = '';

    if (stage === 'prototype') {
      if (!selectedIdea || !posterNotes || !timelineNotes || !initialPrompt) {
        return res.status(400).json({ error: 'Missing selectedIdea, posterNotes, timelineNotes, or prompt for Prototype stage.' });
      }

      // Reconstruct prompt with file information
      prompt = `Analyze the following Concept Poster submission for the Prototype stage in design thinking.
      The selected idea is: "${selectedIdea}"
      The poster contains the following notes:
      ${Object.entries(JSON.parse(posterNotes)).map(([boxId, notes]) => `  ${boxId}: ${notes.join(', ')}`).join('\n')}
      The timeline notes are:
      ${Object.entries(JSON.parse(timelineNotes)).map(([weekId, notes]) => `  ${weekId}: ${notes.join(', ')}`).join('\n')}
      ${files.length > 0 ? `The user has also uploaded ${files.length} supporting documents (images/PDFs) for their prototype. Please consider these as additional context for the analysis, even though their content is not directly provided in this text prompt.` : ''}
      Please return a JSON object containing the score and feedback for the prototype, taking into account the textual information and the uploaded files.`;

      // If files are present, create parts for multimodal input
      const modelParts = [
        { text: prompt }
      ];

      for (const file of files) {
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType) {
            console.warn(`Could not determine file type for ${file.originalname}. Skipping.`);
            continue;
        }

        const mimeType = fileType.mime;

        // Encode file buffer to base64
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
      } catch (parseError) {
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

      const insightsString = JSON.parse(insights).map(i => `Persona: ${i.persona}, Activity: ${i.activity}, Because: ${i.because}, But: ${i.but}`).join('\n');
      const themesString = JSON.parse(themes).join('\n');

      prompt = `Analyze the following user inputs for the Empathize stage in design thinking, specifically for the problem: "${JSON.parse(selectedProblem).title}" (Context: "${JSON.parse(selectedProblem).context}").

Empathy Map Input: "${empathyMapInput}"
Reflection: "${reflection}"
Kanban Themes: "${themesString}"
Kanban Insights (focus on these for depth, relevance, and Sci-Bono criteria - true to user, surprising/revealing, helpful for defining problems):
${insightsString}

Provide a score out of 100 for accuracy, clarity, completeness, and adherence to Sci-Bono criteria. Impose stricter scoring: scores below 50 should be given for incomplete, vague, or generic notes/insights. Deduct points for unprocessed data or lack of detailed emotional insights and problem connections. Your feedback MUST include: 1) Specific strengths, 2) Areas for improvement with examples, 3) Actionable suggestions, and 4) An overall comment. Your response MUST be a JSON object with the following properties: 'score' (number), 'strengths' (string), 'improvements' (string), 'suggestions' (array of strings), and 'overallComment' (string).`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Attempt to extract and parse the JSON response from Gemini
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
      } catch (parseError) {
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

    } else if (stage === 'ideate') {
      const { hmw, selectedTop3Ideas, rationaleMap, reflection, selectedProblem } = req.body;
      if (!hmw || !selectedTop3Ideas || !rationaleMap || !reflection || !selectedProblem) {
        return res.status(400).json({ error: 'Missing HMW, selected top 3 ideas, rationale map, reflection, or selected problem for Ideate stage.' });
      }

      const ideasString = JSON.parse(selectedTop3Ideas).map(idea => {
        const rationale = JSON.parse(rationaleMap)[idea] || 'No rationale provided.';
        return `- Idea: "${idea}"\n  Rationale: "${rationale}"`;
      }).join('\n');

      prompt = `Analyze the following Ideate stage submission for the design thinking process.
The selected problem statement the user is trying to solve is: "${JSON.parse(selectedProblem).title}" (Context: "${JSON.parse(selectedProblem).context}").
The How-Might-We (HMW) question addressed is: "${hmw}".

User's Top 3 Ideas and their Rationales:
${ideasString}

User's Reflection: "${reflection}"

Score this Ideate stage (0-100). Penalize <60 if ideas are generic, rationales weak, or reflection missing problem links to the original problem or the selected HMW.
Consider the creativity, feasibility, and relevance of the ideas to the HMW and the problem. Evaluate the strength and clarity of the rationales. Assess if the reflection effectively connects the ideas back to the HMW and the original problem.
Your feedback MUST include: 1) Specific strengths, 2) Areas for improvement with examples, 3) Actionable suggestions, and 4) An overall comment. Your response MUST be a JSON object with the following properties: 'score' (number), 'strengths' (string), 'improvements' (string), 'suggestions' (array of strings), and 'overallComment' (string).`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Attempt to extract and parse the JSON response from Gemini
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
      } catch (parseError) {
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

      

          } else if (stage === 'define') {

            const { hmwList, selectedProblem, themes, reflection } = req.body;

      

            if (!hmwList || hmwList.length === 0 || !selectedProblem || !themes || themes.length === 0 || !reflection) {

              return res.status(400).json({ error: 'Missing HMW list, selected problem, themes, or reflection for Define stage.' });

            }

      

            const hmwListString = JSON.parse(hmwList).map((hmw) => `- ${hmw}`).join('\n');

            const themesString = JSON.parse(themes).map((theme) => `- ${theme.title}: ${theme.description}`).join('\n');

      

            prompt = `Analyze the following Define stage submission for the design thinking process.

      The selected problem statement the user is trying to solve is: "${JSON.parse(selectedProblem).title}" (Context: "${JSON.parse(selectedProblem).context}").

      

      User's How Might We (HMW) Questions:

      ${hmwListString}

      

      Empathy Themes from previous stage:

      ${themesString}

      

      User's Reflection: "${reflection}"

      

      Provide a score out of 100 for the quality of the HMW questions (specificity, actionability, breadth), their relevance to the selected problem and empathy themes, and the insightfulness of the reflection. Penalize <60 if HMWs are too broad/narrow, not actionable, or the reflection is superficial.

      Your feedback MUST include: 1) Specific strengths, 2) Areas for improvement with examples, 3) Actionable suggestions, and 4) An overall comment. Your response MUST be a JSON object with the following properties: 'score' (number), 'strengths' (string), 'improvements' (string), 'suggestions' (array of strings), and 'overallComment' (string).`;

          

            const result = await model.generateContent(prompt);

            const response = await result.response;

            const text = response.text();

      

            // Attempt to extract and parse the JSON response from Gemini

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

            } catch (parseError) {

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

          } else {

            return res.status(400).json({ error: 'Invalid stage provided.' });

          }

      

        } catch (error) {

          console.error('Error calling Gemini API for scoring:', error.message);

          console.error('Error stack:', error.stack);

          res.status(500).json({

            error: 'Failed to get score from AI. Please try again later.',

            details: error.message,

            score: 50,

            strengths: 'N/A',

            improvements: 'Failed to connect to AI service.',

            suggestions: ['Check your internet connection or try again later.'],

            overallComment: 'An error occurred.'

          });

        }

      });

      

      // New endpoint for Prototype scoring with multimodal input

      app.post('/api/gemini-score-prototype', async (req, res) => {

        console.log('Server: Received /api/gemini-score-prototype request with body:', req.body);

        const { selectedIdea, poster, uploads } = req.body;

      

        if (!selectedIdea || !poster) {

          return res.status(400).json({ error: 'Missing selected idea or poster content.' });

        }

      

        try {

          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

          console.log('Using Gemini model for prototype scoring:', 'gemini-2.0-flash');

      

          const modelParts = [

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

              // Gemini expects base64 data without the "data:image/png;base64," prefix

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

          } catch (parseError) {

            console.error('Error parsing Gemini prototype score response as JSON:', parseError);

            return res.status(500).json({ error: 'AI response could not be parsed. Please try again.', rawResponse: text });

          }

      

          if (typeof parsedResponse.score !== 'number' ||

              typeof parsedResponse.strengths !== 'string' ||

              typeof parsedResponse.improvements !== 'string' ||

              !Array.isArray(parsedResponse.suggestions) ||

              typeof parsedResponse.overallComment !== 'string' ||

              typeof parsedResponse.addressesProblem !== 'boolean') { // Validate new property

            console.error('AI response in unexpected format:', parsedResponse);

            return res.status(500).json({

              error: 'AI response in unexpected format. Providing fallback score.',

              score: 50,

              strengths: 'N/A',

              improvements: 'Could not parse detailed feedback.',

              suggestions: ['Ensure your input is clear and concise.'],

              overallComment: 'Please try again.',

              addressesProblem: false, // Fallback for new property

            });

          }

      

          res.json(parsedResponse);

      

        } catch (error) {

          console.error('Error calling Gemini API for prototype scoring:', error.message);

          console.error('Error stack:', error.stack);

          res.status(500).json({

            error: 'Failed to get score from AI. Please try again later.',

            details: error.message,

            score: 50,

            strengths: 'N/A',

            improvements: 'Failed to connect to AI service.',

            suggestions: ['Check your internet connection or try again later.'],

            overallComment: 'An error occurred.',

            addressesProblem: false, // Fallback for new property

          });

        }

      });

      

      

      app.post('/api/gemini-persona', async (req, res) => {

        console.log('Server: Received /api/gemini-persona request with body:', req.body);

        const { persona, prototypeData, problemTitle } = req.body; // Added problemTitle

  if (!persona || !prototypeData || !problemTitle) { // Added problemTitle validation
    return res.status(400).json({ error: 'Missing persona, prototype data, or problem title.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Using gemini-2.0-flash for persona feedback
    console.log('Using Gemini model for persona feedback:', 'gemini-2.0-flash');

    const { selectedIdea, posterNotes, timelineNotes } = prototypeData;

    const posterNotesString = Object.entries(posterNotes)
      .map(([boxId, notes]) => `  ${boxId}: ${notes.join(', ')}`)
      .join('\n');

    const timelineNotesString = Object.entries(timelineNotes)
      .map(([weekId, notes]) => `  ${weekId}: ${notes.join(', ')}`)
      .join('\n');

    const prompt = `You are ${persona.name}, a ${persona.role} in SA. This prototype tries to solve ${problemTitle}. Here are the notes:
${posterNotesString}
${timelineNotesString}
Reply in 4-7 simple B1 sentences: what you like, one worry, one idea.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ feedback: text });

  } catch (error) {
    console.error('Error calling Gemini API for persona feedback:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get persona feedback from AI. Please try again later.',
      details: error.message,
    });
  }
});

app.post('/api/complete-quest', async (req, res) => {
  console.log('Server: Received /api/complete-quest request with body:', req.body);
  const { userId, problemId, totalScore, solution } = req.body; // Added solution

  if (totalScore === undefined || !problemId || !userId || !solution) { // Added solution validation
    return res.status(400).json({ error: 'Missing totalScore, problemId, userId, or solution.' });
  }

  // Mock saving to DB
  const newQuestEntry = { userId, problemId, totalScore, solution, timestamp: new Date() };
  completedQuests.push(newQuestEntry);
  console.log('Completed quests:', completedQuests);

  // Recalculate leaderboard rank (simple example)
  const rank = Math.round((totalScore / 500) * 100); // Percentage score as rank
  const baseReward = 100; // Example base reward
  const reward = baseReward * 2; // Double reward
  const badge = 'Innovator'; // Placeholder badge

  console.log(`Quest completed by user ${userId} for problem ${problemId} with score ${totalScore}. Rank: ${rank}, Reward: ${reward}, Badge: ${badge}`);

  res.json({ rank, reward, badge, message: 'Quest completed successfully!' });
});

app.get('/api/leaderboard', async (req, res) => {
  console.log('Server: Received /api/leaderboard request with query:', req.query);
  const { problemId } = req.query;

  if (!problemId) {
    return res.status(400).json({ error: 'Missing problemId query parameter.' });
  }

  // Filter completed quests for the given problemId
  let leaderboardEntries = completedQuests
    .filter(quest => String(quest.problemId) === String(problemId))
    .map(quest => ({
      userId: quest.userId,
      username: quest.userId, // Assuming userId is username for mock
      avatar: 'https://models.readyplayer.me/690dd5c4672cca15c22548fe.glb', // Placeholder avatar
      problemTitle: 'Problem ' + quest.problemId, // Placeholder, ideally fetch from DB
      solution: quest.solution,
      totalScore: quest.totalScore,
    }));

  // Sort by totalScore DESC and add rank
  leaderboardEntries.sort((a, b) => b.totalScore - a.totalScore);
  leaderboardEntries = leaderboardEntries.map((entry, index) => ({ ...entry, rank: index + 1 }));

  res.json(leaderboardEntries);
});




app.get('/api/rpm-avatar-proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL query parameter.' });
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Length', response.data.length); // Add Content-Length header
    res.send(response.data);
  } catch (error) {
    console.error('Error proxying RPM avatar:', error.message);
    res.status(500).json({ error: 'Failed to proxy avatar. Please try again later.' });
  }
});

// New endpoint to update user avatar
app.post('/api/update-avatar', async (req, res) => {
  console.log('Server: Received /api/update-avatar request with body:', req.body);
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



// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
