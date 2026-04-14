import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBikes, getRecentActivities } from "@/lib/bosch-api";
import { StatsClient } from "@/components/stats-client";

export default async function StatsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const [bikes, activities] = await Promise.all([
    getBikes(accessToken),
    getRecentActivities(accessToken, 50),
  ]);

  const bike = bikes[0];

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold tracking-tight mt-1">Statistics</h1>
          <p className="text-xs text-muted-foreground">{activities.length} total rides</p>
        </div>
      </div>

      <StatsClient activities={activities} bike={bike} />
    </>
  );
}
