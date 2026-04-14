import "server-only";

import { auth } from "@/auth";

/**
 * Get the Bosch API access token from the server-side JWT.
 * This token is NEVER exposed to the browser.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await auth();
  if (!session) return null;

  // Access the raw JWT token which contains accessToken
  // The session callback strips it, but the JWT callback stores it
  // We need to access it via the token directly
  const { encode, decode } = await import("@auth/core/jwt");
  const { cookies } = await import("next/headers");

  const cookieStore = await cookies();
  const sessionToken =
    cookieStore.get("authjs.session-token")?.value ??
    cookieStore.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const token = await decode({
      token: sessionToken,
      secret,
      salt:
        cookieStore.get("__Secure-authjs.session-token")?.value
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
    });
    return (token?.accessToken as string) ?? null;
  } catch {
    return null;
  }
}
