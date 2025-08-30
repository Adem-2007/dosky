import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import limitUseRoutes from './routes/limitUseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { protect } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

console.log('--- Verifying Stripe Secret Key ---');
console.log('Stripe Key Loaded:', !!process.env.STRIPE_SECRET_KEY);
console.log('--- End Verification ---');

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

// +++ FIX PART 1: Keep the specific webhook route handler here, BEFORE express.json() +++
// This ensures the webhook endpoint gets the raw body it needs.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

// This will handle JSON parsing for all other routes.
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => res.send('API is running...'));

// --- API Routes ---
app.use('/api/auth', authRoutes);

// +++ FIX PART 2: Add a new, general handler for all other protected Stripe routes +++
// This tells Express to use stripeRoutes for any path starting with '/api/stripe'
// It is placed AFTER express.json() so it can correctly parse the request body.
app.use('/api/stripe', protect, stripeRoutes);
app.use('/api/limits', limitUseRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/summary', protect, summaryRoutes);
app.use('/api/contact', contactRoutes);

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));