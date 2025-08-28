import express from 'express';
import { OpenAI } from 'openai';
import asyncHandler from 'express-async-handler';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate', asyncHandler(async (req, res) => {
  // --- MODIFIED: Destructure language from the request body ---
  const { text, language = 'English' } = req.body;

  if (!text || text.trim().length === 0) {
    res.status(400);
    throw new Error('No text provided for summarization.');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          // --- MODIFIED: Updated system prompt to include language instruction ---
          "content": `You are a highly skilled AI assistant trained to summarize documents. Your task is to provide a concise, clear, and accurate summary of the provided text. You MUST write the summary in the following language: ${language}. Focus on the key points, main arguments, and important conclusions.`
        },
        {
          "role": "user",
          "content": `Please summarize the following document text:\n\n---\n\n${text}`
        }
      ],
      temperature: 0.5,
      max_tokens: 512,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Error from OpenAI API:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate summary.' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
}));

export default router;