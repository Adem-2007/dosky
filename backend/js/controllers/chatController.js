// controllers/chatController.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @desc    Generate a chat response based on document text and conversation history
 * @route   POST /api/chat/generate
 * @access  Private
 */
const generateChatResponse = async (req, res) => {
  // Now expecting 'text' (the document) and 'messages' (the conversation history)
  const { text, messages } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text from document is required.' });
  }

  // --- PROMPT ENGINEERING ---
  // The system prompt always provides the context of the document.
  const systemPrompt = `You are an expert AI assistant specialized in analyzing and answering questions about the provided document. 
  Your primary and sole source of information is the text below. You must base all your answers on this text only. 
  Do not use any external knowledge. If the answer is not found in the text, you must state that clearly.
  Here is the document you need to become an expert on:
  --- DOCUMENT START ---
  ${text}
  --- DOCUMENT END ---
  
  Now, please introduce yourself and invite the user to ask any questions about this document.`;

  // Determine the message array to send to OpenAI
  let messagesToSend = [];

  // If this is the first message (messages array is empty or not provided), 
  // we only need the system prompt to get the introduction.
  if (!messages || messages.length === 0) {
    messagesToSend.push({ role: 'system', content: systemPrompt });
  } else {
    // For follow-up messages, we send the system prompt first, then the entire conversation history.
    messagesToSend = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesToSend, // Use the constructed message array
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        const data = { content };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Error with OpenAI API:', error);
    res.end();
  }
};

export { generateChatResponse };