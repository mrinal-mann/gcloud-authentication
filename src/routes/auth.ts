/**
 * Authentication Routes
 * Provides endpoints for token generation and authentication
 */
import { Router, Request, Response, NextFunction } from "express";
import { getCloudRunToken, getFCMAuthToken } from "../utils/google-auth";
import { verifyFirebaseToken } from "../middleware/firebase";

const router = Router();
export const validateServiceRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const serviceToken = req.headers["x-service-token"];

  if (serviceToken !== process.env.SERVICE_AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized service request" });
  }

  next();
};

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
 * Route to get a public token - requires Google Cloud authentication
 * This is used by the frontend to authenticate with the backend service
 * Caller must provide a valid Google identity token in the Authorization header
 */
router.get("/public-token", async (req: Request, res: Response) => {
  try {
    console.log("Received request for public token");
    // The request is authenticated via IAM at the Cloud Run level
    // so we don't need to do additional authentication here

    const token = await getCloudRunToken();

    // Return the token with an expiration
    console.log("Generated public token successfully");
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
    console.error("Error generating FCM token:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

/**
 * Simple health check route (no authentication required)
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

export default router;
