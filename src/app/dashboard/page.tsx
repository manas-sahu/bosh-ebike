import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/auth-utils";
import { getBikes, getRecentActivities, getActivityDetails } from "@/lib/bosch-api";
import { BikeInfoCard } from "@/components/bike-info-card";
import { BatteryCard } from "@/components/battery-card";
import { OdometerCard } from "@/components/odometer-card";
import { AssistModesCard } from "@/components/assist-modes-card";
import { RideSummaryCard } from "@/components/ride-summary-card";
import { RecentRides } from "@/components/recent-rides";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import type { BoschActivityDetail } from "@/types/bosch";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const [bikes, activities] = await Promise.all([
    getBikes(accessToken),
    getRecentActivities(accessToken, 50),
  ]);

  const bike = bikes[0];

  if (!bike) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No eBikes found. Make sure your bike is registered in the Bosch Flow
          app and data sharing is enabled.
        </p>
      </div>
    );
  }

  const recentThree = activities.slice(0, 3);
  const detailsMap = new Map<string, BoschActivityDetail[]>();
  const detailsResults = await Promise.allSettled(
    recentThree.map((a) =>
      getActivityDetails(accessToken, a.id).then((d) => ({ id: a.id, details: d })),
    ),
  );
  for (const result of detailsResults) {
    if (result.status === "fulfilled") {
      detailsMap.set(result.value.id, result.value.details);
    }
  }

  return (
    <>
      <div className="mb-6">
        <BikeInfoCard bike={bike} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <BatteryCard bike={bike} />
        <OdometerCard driveUnit={bike.driveUnit} serviceDue={bike.serviceDue} />
        <AssistModesCard driveUnit={bike.driveUnit} />
      </div>
      <div className="mb-6">
        <RideSummaryCard activities={activities} />
      </div>
      <RecentRides activities={activities} detailsMap={detailsMap} bike={bike} />
    </>
  );
}
