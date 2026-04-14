import { getAccessToken } from "@/lib/auth-utils";
import { getRecentActivities } from "@/lib/bosch-api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "3");
  const limit = Math.min(Math.max(1, rawLimit || 3), 50);

  try {
    const activities = await getRecentActivities(accessToken, limit);
    return Response.json({ activities });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
