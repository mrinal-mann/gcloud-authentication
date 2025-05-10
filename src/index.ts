import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: '*', // Update this to your mobile app's domain in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Auth Proxy Service' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth proxy server running on port ${PORT}`);
});