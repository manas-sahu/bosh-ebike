import { getAccessToken } from "@/lib/auth-utils";
import { getBikes } from "@/lib/bosch-api";

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bikes = await getBikes(accessToken);
    return Response.json({ bikes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}
