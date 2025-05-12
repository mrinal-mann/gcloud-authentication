import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configure CORS properly for all origins
const corsOptions = {
  origin: "*", // Allow all origins in production
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Apply CORS first, before any other middleware
app.use(cors(corsOptions));

// Then parse JSON
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Auth Proxy Service" });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Start server on port 8080 for Cloud Run
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Auth proxy server running on port ${PORT}`);
});