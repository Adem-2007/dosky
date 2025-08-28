import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// Route to handle sending contact form email
router.post('/send', sendContactEmail);

export default router;