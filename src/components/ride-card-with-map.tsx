"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MiniMap } from "@/components/ride-map";
import { formatDate, formatDuration } from "@/lib/utils";
import type { BoschActivitySummary, BoschActivityDetail, BoschBike } from "@/types/bosch";
import { estimateRideConsumption } from "@/lib/battery";

interface RideCardWithMapProps {
  activity: BoschActivitySummary;
  details: BoschActivityDetail[];
  bike?: BoschBike;
}

export function RideCardWithMap({ activity, details, bike }: RideCardWithMapProps) {
  const consumption = bike ? estimateRideConsumption(bike, activity) : null;

  return (
    <Link href={`/dashboard/rides/${activity.id}`}>
      <Card className="bg-card border-border hover:border-emerald-500/30 transition-colors cursor-pointer">
        <CardContent className="py-4">
          <div className="flex gap-4">
            {/* Mini map */}
            <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-28 rounded-lg overflow-hidden">
              <MiniMap details={details} />
            </div>

            {/* Ride info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm truncate">
                  {activity.title || "Untitled Ride"}
                </h3>
                <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0 ml-2">
                  {formatDate(activity.startTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                <Stat label="Distance" value={`${(activity.distance / 1000).toFixed(1)}`} unit="km" color="text-emerald-400" />
                <Stat label="Duration" value={formatDuration(activity.durationWithoutStops / 60)} color="text-blue-400" />
                <Stat label="Avg Speed" value={activity.speed.average.toFixed(1)} unit="km/h" color="text-amber-400" />
                <Stat label="Avg Power" value={activity.riderPower.average.toFixed(0)} unit="W" color="text-purple-400" />
                <Stat label="Elevation" value={`+${activity.elevation.gain.toFixed(0)}`} unit="m" color="text-cyan-400" />
                <Stat label="Calories" value={activity.caloriesBurned.toFixed(0)} unit="kcal" color="text-red-400" />
                {consumption && consumption.estimatedWh > 0 && (
                  <Stat label="Battery" value={`~${consumption.estimatedPercent.toFixed(0)}%`} unit={`${consumption.estimatedWh.toFixed(0)}Wh`} color="text-orange-400" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Stat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold tabular-nums">
        <span className={color ?? ""}>{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
