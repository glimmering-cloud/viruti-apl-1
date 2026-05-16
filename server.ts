import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.post('/api/coach', async (req, res) => {
    try {
      const { playingXI, benchedPlayer, incomingPlayer } = req.body;
      
      const prompt = `You are a world-class cricket tactical coach. 
      Current Playing XI (Stats: Name, SR, AVG): ${JSON.stringify(playingXI)}
      
      A swap just occurred:
      - Player leaving for bench: ${JSON.stringify(benchedPlayer)}
      - Player coming into Playing XI: ${JSON.stringify(incomingPlayer)}
      
      Provide a concise tactical analysis (max 100 words) explaining the pros and cons of this swap. 
      Mention specific stats if they justify the move. 
      Format the response as JSON with "brief", "pros" (array), and "cons" (array).`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from Gemini');

      try {
        res.json(JSON.parse(text));
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', text);
        res.status(500).json({ 
          brief: "The tactical engine encountered a data format error.",
          pros: ["Strategic shift in lineup recorded"],
          cons: ["Detailed AI analysis temporarily unavailable"]
        });
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
