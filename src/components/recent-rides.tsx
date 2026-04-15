import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatDuration } from "@/lib/utils";
import { RideCardWithMap } from "@/components/ride-card-with-map";
import type { BoschActivitySummary, BoschActivityDetail, BoschBike } from "@/types/bosch";

interface RecentRidesProps {
  activities: BoschActivitySummary[];
  detailsMap?: Map<string, BoschActivityDetail[]>;
  bike?: BoschBike;
}

export function RecentRides({ activities, detailsMap, bike }: RecentRidesProps) {
  const displayActivities = activities.slice(0, 3);

  if (activities.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BikeIcon />
            Recent Rides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No rides recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BikeIcon />
          Recent Rides
        </h2>
        <Link
          href="/dashboard/rides"
          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          View all rides &rarr;
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {displayActivities.map((activity) => (
          <RideCardWithMap
            key={activity.id}
            activity={activity}
            details={detailsMap?.get(activity.id) ?? []}
            bike={bike}
          />
        ))}
      </div>
    </div>
  );
}

function BikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><circle cx="18.5" cy="17.5" r="3.5" /><circle cx="5.5" cy="17.5" r="3.5" /><circle cx="15" cy="5" r="1" /><path d="M12 17.5V14l-3-3 4-3 2 3h2" /></svg>
  );
}
