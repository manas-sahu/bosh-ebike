import { getAccessToken } from "@/lib/auth-utils";
import { getActivitiesPaginated } from "@/lib/bosch-api";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawLimit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  const rawOffset = Number(request.nextUrl.searchParams.get("offset") ?? "0");
  const limit = Math.min(Math.max(1, rawLimit || 10), 50);
  const offset = Math.max(0, rawOffset || 0);

  try {
    const result = await getActivitiesPaginated(accessToken, limit, offset);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
