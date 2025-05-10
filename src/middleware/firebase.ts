// src/middleware/firebase.ts
import admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// Function to properly format the private key
function formatPrivateKey(key: string | undefined): string {
  if (!key) return "";

  // If the key already contains actual newlines, return it as is
  if (key.includes("\n") && !key.includes("\\n")) {
    return key;
  }

  // Replace \\n with actual newlines and ensure proper PEM format
  const formattedKey = key.replace(/\\n/g, "\n");

  // Ensure the key has the correct beginning and ending
  if (!formattedKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
    return `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----\n`;
  }

  return formattedKey;
}

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    console.log("Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

/**
 * Middleware to verify Firebase authentication token
 */
export function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const idToken = authHeader.split("Bearer ")[1];

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error("Error verifying Firebase token:", error);
      res.status(403).json({ error: "Unauthorized: Invalid token" });
    });
}

// Add type definition for the user property on Request
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}
