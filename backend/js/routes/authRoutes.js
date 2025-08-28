import express from 'express';
import { register, verifyEmail, login, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // <-- IMPORT protect

const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyEmail);
router.post('/login', login);
router.get('/profile', protect, getUserProfile); // <-- ADDED new protected route

export default router;