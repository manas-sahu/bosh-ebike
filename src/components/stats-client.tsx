"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DistanceChart, SpeedPowerChart, CaloriesChart,
  ElevationChart, BatteryConsumptionChart, DurationChart,
} from "@/components/stats-charts";
import {
  type Period, type PeriodStats, type DailyPoint,
  computeStats, filterActivities, toDailyPoints, getPeriodRange,
} from "@/lib/stats";
import { formatDuration } from "@/lib/utils";
import type { BoschActivitySummary, BoschBike } from "@/types/bosch";

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

interface StatsClientProps {
  activities: BoschActivitySummary[];
  bike?: BoschBike;
}

export function StatsClient({ activities, bike }: StatsClientProps) {
  const [period, setPeriod] = useState<Period>("month");

  const stats = computeStats(activities, period, bike);
  const filtered = filterActivities(activities, period);
  const daily = toDailyPoints(filtered, bike);

  return (
    <>
      {/* Period tabs */}
      <div className="flex items-center gap-1.5 mb-6 bg-secondary/50 rounded-lg p-1 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
              period === p.key
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* No data state */}
      {stats.rides === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No rides in this period.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <KpiCard label="Total Rides" value={String(stats.rides)} color="text-foreground" />
            <KpiCard label="Total Distance" value={stats.totalDistanceKm.toFixed(1)} unit="km" color="text-emerald-400" />
            <KpiCard label="Total Time" value={formatDuration(stats.totalDurationMin)} color="text-blue-400" />
            <KpiCard label="Total Calories" value={stats.totalCalories.toFixed(0)} unit="kcal" color="text-red-400" />
            <KpiCard label="Total Elevation" value={`+${stats.totalElevationGain.toFixed(0)}`} unit="m" color="text-cyan-400" />
            <KpiCard label="Avg Distance/Ride" value={stats.avgDistPerRideKm.toFixed(1)} unit="km" color="text-emerald-300" />
            <KpiCard label="Avg Speed" value={stats.avgSpeedKmh.toFixed(1)} unit="km/h" color="text-amber-400" />
            <KpiCard label="Top Speed" value={stats.maxSpeedKmh.toFixed(1)} unit="km/h" color="text-amber-300" />
            <KpiCard label="Avg Power" value={stats.avgPowerW.toFixed(0)} unit="W" color="text-purple-400" />
            <KpiCard label="Peak Power" value={String(stats.maxPowerW)} unit="W" color="text-purple-300" />
            <KpiCard label="Avg Cadence" value={stats.avgCadence.toFixed(0)} unit="rpm" color="text-cyan-300" />
            <KpiCard label="Difficulty" value={stats.avgDifficultyMPerKm.toFixed(1)} unit="m/km" color="text-orange-400" />
            <KpiCard
              label="Rides/Day"
              value={stats.avgRidesPerDay.toFixed(2)}
              color="text-blue-300"
            />
            {stats.totalEstimatedWh > 0 && (
              <KpiCard label="Est. Battery Used" value={stats.totalEstimatedWh.toFixed(0)} unit="Wh" color="text-orange-400" />
            )}
            <KpiCard label="Elevation Loss" value={`-${stats.totalElevationLoss.toFixed(0)}`} unit="m" color="text-red-300" />
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <DistanceChart data={daily} />
            <DurationChart data={daily} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <SpeedPowerChart data={daily} />
            <CaloriesChart data={daily} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ElevationChart data={daily} />
            <BatteryConsumptionChart data={daily} />
          </div>
        </>
      )}
    </>
  );
}

function KpiCard({ label, value, unit, color }: {
  label: string; value: string; unit?: string; color: string;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-3 pb-3">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-lg font-bold tabular-nums">
          <span className={color}>{value}</span>
          {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
