/**
 * Google Cloud Authentication Utilities
 * Handles token generation for Firebase Cloud Messaging (FCM)
 */
import { GoogleAuth, JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Auth for Cloud Run
export const cloudRunAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLOUD_RUN_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.CLOUD_RUN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

/**
 * Get an access token for Cloud Run
 * Used to authenticate requests between services
 */
export async function getCloudRunToken(): Promise<string> {
  try {
    const client = await cloudRunAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token || '';
  } catch (error) {
    console.error('Error getting Cloud Run token:', error);
    throw new Error('Failed to get Cloud Run access token');
  }
}

/**
 * Generates an OAuth token specifically for FCM API
 * Uses Firebase service account credentials
 */
export async function getFCMAuthToken(): Promise<string> {
  try {
    // Get service account details from environment
    const serviceAccount = {
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      project_id: process.env.FIREBASE_PROJECT_ID
    };
    
    // Create JWT client with appropriate scope
    const jwtClient = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    
    // Get the token
    const token = await jwtClient.authorize();
    return token.access_token || '';
  } catch (error) {
    console.error('Error generating FCM token:', error);
    throw new Error('Failed to generate FCM authorization token');
  }
}