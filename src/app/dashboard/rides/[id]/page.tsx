import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBikes, getRecentActivities, getActivityDetails } from "@/lib/bosch-api";
import { formatDate, formatDuration, formatSpeed } from "@/lib/utils";
import { estimateRideConsumption, getBatteryCapacity } from "@/lib/battery";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RideMap } from "@/components/ride-map";
import { ElevationProfile } from "@/components/elevation-profile";
import { GpxExportButton } from "@/components/export-buttons";

export default async function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = await getAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const [bikes, activities, details] = await Promise.all([
    getBikes(accessToken),
    getRecentActivities(accessToken, 50),
    getActivityDetails(accessToken, id).catch(() => []),
  ]);

  const bike = bikes[0];

  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ride not found.</p>
        <Link href="/dashboard/rides" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
          &larr; Back to rides
        </Link>
      </div>
    );
  }

  const startDate = new Date(activity.startTime);
  const endDate = new Date(activity.endTime);
  const totalDurationMin = (endDate.getTime() - startDate.getTime()) / 60_000;
  const stoppedMin = totalDurationMin - activity.durationWithoutStops / 60;
  const distKm = activity.distance / 1000;
  const difficulty = distKm > 0 ? (activity.elevation.gain / distKm).toFixed(1) : "0";
  const startOdoKm = activity.startOdometer ? (activity.startOdometer / 1000).toFixed(1) : null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between pb-6">
        <div>
          <Link
            href="/dashboard/rides"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to All Rides
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-2">
            {activity.title || "Untitled Ride"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(activity.startTime)}
            {activity.timeZone && <span className="text-xs ml-1">({activity.timeZone})</span>}
            {" · "}
            {startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            {" - "}
            {endDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <GpxExportButton activity={activity} details={details} />
      </div>

      {/* Map */}
      <div className="mb-6">
        <RideMap details={details} />
      </div>

      {/* Key metrics */}
      {(() => {
        const consumption = bike ? estimateRideConsumption(bike, activity) : null;
        return (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-6 mb-6">
            <MetricCard label="Distance" value={distKm.toFixed(1)} unit="km" icon={<RulerIcon />} color="text-emerald-400" />
            <MetricCard label="Moving Time" value={formatDuration(activity.durationWithoutStops / 60)} icon={<ClockIcon />} color="text-blue-400" />
            <MetricCard label="Avg Speed" value={activity.speed.average.toFixed(1)} unit="km/h" icon={<SpeedIcon />} color="text-amber-400" />
            <MetricCard label="Avg Power" value={activity.riderPower.average.toFixed(0)} unit="W" icon={<PowerIcon />} color="text-purple-400" />
            <MetricCard label="Calories" value={activity.caloriesBurned.toFixed(0)} unit="kcal" icon={<FlameIcon />} color="text-red-400" />
            {consumption && consumption.estimatedWh > 0 && (
              <MetricCard label="Battery Used" value={`~${consumption.estimatedPercent.toFixed(1)}`} unit={`% (${consumption.estimatedWh.toFixed(0)} Wh)`} icon={<BatteryIcon />} color="text-orange-400" />
            )}
          </div>
        );
      })()}

      {/* Elevation profile */}
      {details.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <ElevationProfile details={details} />
        </div>
      )}

      {/* Detailed stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Speed */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Speed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Average" value={formatSpeed(activity.speed.average)} color="text-amber-400" />
            <StatRow label="Maximum" value={formatSpeed(activity.speed.maximum)} color="text-amber-300" />
          </CardContent>
        </Card>

        {/* Power */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Power</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Average" value={`${activity.riderPower.average.toFixed(0)} W`} color="text-purple-400" />
            <StatRow label="Maximum" value={`${activity.riderPower.maximum.toFixed(0)} W`} color="text-purple-300" />
          </CardContent>
        </Card>

        {/* Cadence */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cadence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Average" value={`${activity.cadence.average.toFixed(0)} rpm`} color="text-cyan-400" />
            <StatRow label="Maximum" value={`${activity.cadence.maximum.toFixed(0)} rpm`} color="text-cyan-300" />
          </CardContent>
        </Card>

        {/* Elevation */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Elevation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Gain" value={`+${activity.elevation.gain.toFixed(0)} m`} color="text-emerald-400" />
            <StatRow label="Loss" value={`-${activity.elevation.loss.toFixed(0)} m`} color="text-red-400" />
            <StatRow label="Difficulty" value={`${difficulty} m/km`} color="text-orange-400" />
          </CardContent>
        </Card>

        {/* Time */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Moving" value={formatDuration(activity.durationWithoutStops / 60)} color="text-blue-400" />
            <StatRow label="Total" value={formatDuration(totalDurationMin)} />
            <StatRow label="Stopped" value={stoppedMin > 0 ? formatDuration(stoppedMin) : "0m"} />
          </CardContent>
        </Card>

        {/* Ride Info */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ride Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatRow label="Distance" value={`${distKm.toFixed(2)} km`} color="text-emerald-400" />
            {startOdoKm && <StatRow label="Start Odometer" value={`${startOdoKm} km`} />}
            {activity.timeZone && <StatRow label="Time Zone" value={activity.timeZone} />}
            {details.length > 0 && <StatRow label="GPS Points" value={details.length.toLocaleString()} color="text-sky-400" />}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MetricCard({ label, value, unit, icon, color }: {
  label: string; value: string; unit?: string; icon: React.ReactNode; color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={color}>{icon}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          <span className={color}>{value}</span>
          {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color ?? ""}`}>{value}</span>
    </div>
  );
}

function RulerIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>;
}
function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
}
function SpeedIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>;
}
function FlameIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}
function PowerIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>;
}
function BatteryIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /></svg>;
}
