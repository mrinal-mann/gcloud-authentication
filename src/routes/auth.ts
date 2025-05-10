import { Router, Request, Response } from "express";
import { getCloudRunToken } from "../utils/google-auth";
import { verifyFirebaseToken } from "../middleware/firebase";

const router = Router();

// Route to get a Cloud Run token (requires Firebase authentication)
router.get(
  "/token",
  verifyFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const token = await getCloudRunToken();

      // Return the token with a short expiration (tokens typically last 1 hour)
      res.json({
        token,
        expiresIn: 3600,
        userId: req.user?.uid,
      });
    } catch (error) {
      console.error("Error in /token route:", error);
      res.status(500).json({ error: "Failed to get access token" });
    }
  }
);
router.get("/public-token", async (req: Request, res: Response) => {
  try {
    const token = await getCloudRunToken();

    // Return the token with an expiration (tokens typically last 1 hour)
    res.json({
      token,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error in /public-token route:", error);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

// Simple health check route (doesn't require authentication)
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default router;
