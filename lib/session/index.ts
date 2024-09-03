import { jwtVerify, JWTVerifyResult } from 'jose';

const secret = process.env.SECRET_KEY || "your-secret-key"; // Replace with your actual secret key

// Define the interface for your session payload if needed
interface SessionPayload {
  sub: string;
  // Add other session-related fields if necessary
}

// Function to decrypt the JWT session token
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    // Create a TextEncoder to encode the secret
    const enc = new TextEncoder();

    // Verify and decode the token
    const { payload } = await jwtVerify(token, enc.encode(secret));

    // Cast the payload to SessionPayload
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    return null;
  }
}