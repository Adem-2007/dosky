import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import paypalRoutes from './routes/paypalRoutes.js';
import limitUseRoutes from './routes/limitUseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import contactRoutes from './routes/contactRoutes.js'; // <-- IMPORT THE NEW ROUTE
import { protect } from './middleware/authMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: [
    'http://35.208.7.63',
    'http://localhost:5173',
    'http://localhost:5001',
    'http://www.dosky.tech', // <-- ADD THIS LINE
    'http://dosky.tech' // <-- ADD THIS LINE
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => res.send('API is running...'));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/paypal', protect, paypalRoutes);
app.use('/api/limits', limitUseRoutes);
app.use('/api/chat', protect, chatRoutes);
app.use('/api/summary', protect, summaryRoutes);
app.use('/api/contact', contactRoutes); // <-- USE THE NEW ROUTE

// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));