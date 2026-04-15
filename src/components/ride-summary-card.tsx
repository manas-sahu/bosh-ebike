import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import type { BoschActivitySummary } from "@/types/bosch";

interface RideSummaryCardProps {
  activities: BoschActivitySummary[];
}

export function RideSummaryCard({ activities }: RideSummaryCardProps) {
  if (activities.length === 0) return null;

  const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0) / 1000;
  const totalDuration = activities.reduce((sum, a) => sum + a.durationWithoutStops, 0) / 60;
  const totalCalories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const totalElevation = activities.reduce((sum, a) => sum + a.elevation.gain, 0);
  const avgSpeed = activities.reduce((sum, a) => sum + a.speed.average, 0) / activities.length;
  const avgPower = activities.reduce((sum, a) => sum + a.riderPower.average, 0) / activities.length;
  const avgCadence = activities.reduce((sum, a) => sum + a.cadence.average, 0) / activities.length;
  const maxSpeed = Math.max(...activities.map((a) => a.speed.maximum));
  const maxPower = Math.max(...activities.map((a) => a.riderPower.maximum));

  // Days since last ride
  const lastRideTime = new Date(activities[0].startTime).getTime();
  const daysSinceLast = Math.floor((Date.now() - lastRideTime) / 86_400_000);

  // Average difficulty (m/km)
  const avgDifficulty = activities.reduce((sum, a) => {
    const distKm = a.distance / 1000;
    return sum + (distKm > 0 ? a.elevation.gain / distKm : 0);
  }, 0) / activities.length;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" /></svg>
          Lifetime Stats
          <span className="text-xs font-normal ml-auto flex items-center gap-3">
            {activities.length} rides
            <Link href="/dashboard/stats" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Stats &rarr;
            </Link>
            <Link href="/dashboard/insights" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
              Insights &rarr;
            </Link>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-3">
          <MetricItem label="Total Distance" value={totalDistance.toFixed(1)} unit="km" color="text-emerald-400" />
          <MetricItem label="Total Time" value={formatDuration(totalDuration)} color="text-blue-400" />
          <MetricItem label="Total Calories" value={totalCalories.toFixed(0)} unit="kcal" color="text-red-400" />
          <MetricItem label="Total Elevation" value={`+${totalElevation.toFixed(0)}`} unit="m" color="text-cyan-400" />
          <MetricItem
            label="Last Ride"
            value={daysSinceLast === 0 ? "Today" : daysSinceLast === 1 ? "Yesterday" : `${daysSinceLast}d ago`}
            color={daysSinceLast <= 2 ? "text-emerald-400" : daysSinceLast <= 7 ? "text-amber-400" : "text-red-400"}
          />
          <MetricItem label="Avg Speed" value={avgSpeed.toFixed(1)} unit="km/h" color="text-amber-400" />
          <MetricItem label="Avg Power" value={avgPower.toFixed(0)} unit="W" color="text-purple-400" />
          <MetricItem label="Avg Cadence" value={avgCadence.toFixed(0)} unit="rpm" color="text-cyan-300" />
          <MetricItem label="Top Speed" value={maxSpeed.toFixed(1)} unit="km/h" color="text-amber-300" />
          <MetricItem label="Difficulty" value={avgDifficulty.toFixed(1)} unit="m/km" color="text-orange-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, unit, color }: {
  label: string; value: string; unit?: string; color?: string;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        <span className={color ?? ""}>{value}</span>
        {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
