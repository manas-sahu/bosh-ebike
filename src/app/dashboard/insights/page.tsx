import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { getBikes, getRecentActivities } from "@/lib/bosch-api";
import { InsightsClient } from "@/components/insights-client";

export default async function InsightsPage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const [bikes, activities] = await Promise.all([
    getBikes(accessToken),
    getRecentActivities(accessToken, 50),
  ]);

  const bike = bikes[0];

  return (
    <>
      <div className="pb-4">
        <h1 className="text-xl font-semibold tracking-tight">Insights</h1>
        <p className="text-xs text-muted-foreground">
          All-time records, fitness trends &amp; battery intelligence
        </p>
      </div>

      <InsightsClient activities={activities} bike={bike} />
    </>
  );
}
