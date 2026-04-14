import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import "@/types/bosch"; // Import type augmentations

const BOSCH_ISSUER = process.env.AUTH_BOSCH_ISSUER!;
const BOSCH_TOKEN_URL = `${BOSCH_ISSUER}/protocol/openid-connect/token`;

const config: NextAuthConfig = {
  providers: [
    {
      id: "bosch",
      name: "Bosch SingleKey",
      type: "oidc",
      issuer: BOSCH_ISSUER,
      clientId: process.env.AUTH_BOSCH_CLIENT_ID,
      clientSecret: process.env.AUTH_BOSCH_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid offline_access",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: store tokens from the provider
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000,
        };
      }

      // Token still valid (with 60-second buffer)
      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;
      if (Date.now() < expiresAt - 60_000) {
        return token;
      }

      // Token expired — refresh it
      const refreshToken = token.refreshToken;
      if (typeof refreshToken !== "string") {
        return { ...token, error: "RefreshTokenError" };
      }

      try {
        const response = await fetch(BOSCH_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_BOSCH_CLIENT_ID!,
            client_secret: process.env.AUTH_BOSCH_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        });

        const tokens = await response.json();

        if (!response.ok) {
          throw new Error(`Token refresh failed: ${response.status}`);
        }

        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          error: undefined,
        };
      } catch {
        // Clear tokens on refresh failure to prevent stale token usage
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: 0,
          error: "RefreshTokenError",
        };
      }
    },

    async session({ session, token }) {
      // SECURITY: Never expose accessToken to the browser.
      // Only expose error state so the UI can redirect to login.
      session.error = token.error as string | undefined;
      return session;
    },
  },

  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
