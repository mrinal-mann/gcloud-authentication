import { GoogleAuth } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Auth for Cloud Run
export const cloudRunAuth = new GoogleAuth({
  credentials: {
    client_email: process.env.CLOUD_RUN_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.CLOUD_RUN_PRIVATE_KEY
  },
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

/**
 * Get an access token for Cloud Run
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