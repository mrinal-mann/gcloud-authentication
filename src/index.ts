import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Configure CORS
const corsOptions = {
  origin: ["http://localhost:8081", "http://localhost:3000", "*"], // Allow localhost and other origins
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add explicit CORS handling for preflight requests
app.options("*", cors(corsOptions));

// Routes
app.use("/auth", authRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Auth Proxy Service" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Auth proxy server running on port ${PORT}`);
});
