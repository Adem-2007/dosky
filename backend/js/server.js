// server.js (Corrected with separated webhook route)

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// --- Import Routes ---
import authRoutes from './routes/authRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import stripeWebhookRoutes from './routes/stripeWebhookRoutes.js'; // <-- IMPORT NEW WEBHOOK ROUTE
import limitUseRoutes from './routes/limitUseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

connectDB();

const app = express();

const corsOptions = {
  origin: [
    'https://35.208.7.63',
    'http://localhost:5173',
    'http://localhost:5001',
    'https://www.dosky.tech',
    'https://dosky.tech'
  ],
  credentials: true,
};
app.use(cors(corsOptions));

app.get('/', (req, res) => res.send('API is running...'));

// --- Middleware & Route Setup ---

// 1. Stripe Webhook Endpoint
// This MUST come BEFORE express.json() to receive the raw request body.
// We apply the express.raw middleware only to this specific route.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

// 2. JSON Body Parser
// This will parse the body for all other routes that come after it.
app.use(express.json({ limit: '50mb' }));

// 3. Standard API Routes
// These routes will now correctly receive parsed JSON bodies.
app.use('/api/auth', authRoutes);
app.use('/api/stripe', protect, stripeRoutes); // Handles '/create-payment-intent', etc.
app.use('/api/limits', limitUseRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/summary', protect, summaryRoutes);
app.use('/api/contact', contactRoutes);

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));