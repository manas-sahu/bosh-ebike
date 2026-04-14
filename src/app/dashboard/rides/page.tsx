import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBikes, getRecentActivities, getActivityDetails } from "@/lib/bosch-api";
import { RidesListClient } from "@/components/rides-list-client";
import type { BoschActivityDetail } from "@/types/bosch";

export default async function RidesPage() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const [bikes, activities] = await Promise.all([
    getBikes(accessToken),
    getRecentActivities(accessToken, 50),
  ]);

  const bike = bikes[0];

  // Fetch GPS details for all activities in parallel
  const detailsMap: Record<string, BoschActivityDetail[]> = {};
  const detailsResults = await Promise.allSettled(
    activities.map((a) =>
      getActivityDetails(accessToken, a.id).then((d) => ({
        id: a.id,
        details: d,
      })),
    ),
  );
  for (const result of detailsResults) {
    if (result.status === "fulfilled") {
      detailsMap[result.value.id] = result.value.details;
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <Link
            href="/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-xl font-semibold tracking-tight mt-1">All Rides</h1>
          <p className="text-xs text-muted-foreground">{activities.length} rides</p>
        </div>
      </div>

      <RidesListClient activities={activities} detailsMap={detailsMap} bike={bike} />

      {activities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rides recorded yet.</p>
        </div>
      )}
    </>
  );
}
