// routes/chatRoutes.js

import express from 'express';
import { generateChatResponse } from '../controllers/chatController.js';

const router = express.Router();

// The main route for generating a chat response.
// It is protected, so only authenticated users can access it.
router.post('/generate', generateChatResponse);

export default router;