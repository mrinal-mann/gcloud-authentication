/**
 * Authentication Routes
 * Provides endpoints for token generation and authentication
 */
import { Router, Request, Response } from "express";
import { getCloudRunToken, getFCMAuthToken } from "../utils/google-auth";
import { verifyFirebaseToken } from "../middleware/firebase";

const router = Router();

/**
 * Route to get a Cloud Run token
 * Requires Firebase authentication
 */
router.get(
  "/token",
  verifyFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const token = await getCloudRunToken();

      // Return the token with expiration info (tokens typically last 1 hour)
      res.json({
        token,
        expiresIn: 3600,
        userId: req.user?.uid,
      });
    } catch (error) {
      console.error("Error getting access token:", error);
      res.status(500).json({ error: "Failed to get access token" });
    }
  }
);

/**
 * Route to get a public token - does not require authentication 
 * This is used by the frontend to authenticate with the backend service
 */
router.get("/public-token", async (req: Request, res: Response) => {
  try {
    const token = await getCloudRunToken();

    // Return the token with an expiration
    res.json({
      token,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("Error in /public-token route:", error);
    res.status(500).json({ error: "Failed to get access token" });
  }
});

/**
 * Route to get an FCM-specific token for sending notifications
 * Used by the filter-backend service
 */
router.get("/fcm-token", async (req: Request, res: Response) => {
  try {
    const token = await getFCMAuthToken();
    
    // Return the token
    res.json({ token });
  } catch (error) {
    console.error('Error generating FCM token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

/**
 * Simple health check route (no authentication required)
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default router;