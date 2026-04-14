import { getAccessToken } from "@/lib/auth-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE = process.env.BOSCH_API_BASE_URL ?? "https://api.bosch-ebike.com";

async function rawFetch(path: string, token: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return { error: `${res.status} ${res.statusText}` };
  return res.json();
}

export default async function DebugPage() {
  // Only available in development
  if (process.env.NODE_ENV !== "development") notFound();

  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const token = accessToken;

  // Fetch all raw data
  const [bikesRaw, activitiesRaw] = await Promise.all([
    rawFetch("/bike-profile/smart-system/v1/bikes", token),
    rawFetch("/activity/smart-system/v1/activities?limit=2&sort=-startTime", token),
  ]);

  // Get first activity detail if available
  let activityDetailRaw = null;
  const firstActivityId = activitiesRaw?.activitySummaries?.[0]?.id;
  if (firstActivityId) {
    activityDetailRaw = await rawFetch(
      `/activity/smart-system/v1/activities/${firstActivityId}/details`,
      token,
    );
  }

  return (
    <>
      <div className="pb-6">
        <Link
          href="/dashboard"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">API Debug</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Raw JSON responses from all Bosch API endpoints
        </p>
      </div>

      <div className="space-y-6">
        <RawJsonCard
          title="GET /bike-profile/smart-system/v1/bikes"
          description="Bike profiles, drive unit, batteries, service info"
          data={bikesRaw}
        />

        <RawJsonCard
          title="GET /activity/smart-system/v1/activities?limit=2&sort=-startTime"
          description="Activity summaries (showing 2 most recent)"
          data={activitiesRaw}
        />

        {activityDetailRaw && (
          <RawJsonCard
            title={`GET /activity/smart-system/v1/activities/${firstActivityId}/details`}
            description={`Activity GPS details (${Array.isArray(activityDetailRaw?.activityDetails) ? activityDetailRaw.activityDetails.length + " points" : "showing first response"})`}
            data={
              Array.isArray(activityDetailRaw?.activityDetails) && activityDetailRaw.activityDetails.length > 5
                ? {
                    ...activityDetailRaw,
                    activityDetails: [
                      ...activityDetailRaw.activityDetails.slice(0, 3),
                      `... ${activityDetailRaw.activityDetails.length - 5} more points ...`,
                      ...activityDetailRaw.activityDetails.slice(-2),
                    ],
                  }
                : activityDetailRaw
            }
          />
        )}
      </div>
    </>
  );
}

function RawJsonCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: unknown;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono text-emerald-400">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <pre className="text-xs font-mono text-foreground bg-secondary/50 rounded-lg p-4 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap break-words">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
