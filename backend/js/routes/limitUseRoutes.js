// routes/limitUseRoutes.js

import express from 'express';
import { getUploadStatus, incrementUploadCount, incrementChatMessageCount } from '../controllers/limitUseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', protect, getUploadStatus);
router.post('/increment', protect, incrementUploadCount);

// NEW: Route to increment chat message count before sending a message
router.post('/increment-chat', protect, incrementChatMessageCount);

export default router;