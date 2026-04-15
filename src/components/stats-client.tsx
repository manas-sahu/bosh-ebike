"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DistanceChart, SpeedPowerChart, CaloriesChart,
  ElevationChart, BatteryConsumptionChart, DurationChart,
} from "@/components/stats-charts";
import {
  type Period,
  computeStats, toDailyPoints,
} from "@/lib/stats";
import { formatDuration } from "@/lib/utils";
import { PeriodPicker } from "@/components/period-picker";
import type { BoschActivitySummary, BoschBike } from "@/types/bosch";

type ViewMode = "week" | "month" | "year" | "all";

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
  { key: "year", label: "Yearly" },
  { key: "all", label: "All Time" },
];

function getOffsetRange(mode: ViewMode, offset: number) {
  const now = new Date();
  let start: Date;
  let end: Date;
  let label: string;

  if (mode === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start = new Date(now.getFullYear(), now.getMonth(), diff + offset * 7);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    label = offset === 0 ? "This Week" : `${fmt(start)} – ${fmt(end)}`;
  } else if (mode === "month") {
    start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    label = offset === 0
      ? "This Month"
      : start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else if (mode === "year") {
    const y = now.getFullYear() + offset;
    start = new Date(y, 0, 1);
    end = new Date(y, 11, 31);
    label = offset === 0 ? "This Year" : String(y);
  } else {
    start = new Date(0);
    end = new Date(now);
    label = "All Time";
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end, label };
}

interface StatsClientProps {
  activities: BoschActivitySummary[];
  bike?: BoschBike;
}

export function StatsClient({ activities, bike }: StatsClientProps) {
  const [mode, setMode] = useState<ViewMode>("month");
  const [offset, setOffset] = useState(0);

  // Reset offset when switching modes
  const handleModeChange = (m: ViewMode) => {
    setMode(m);
    setOffset(0);
  };

  const { start, end, label } = useMemo(() => getOffsetRange(mode, offset), [mode, offset]);

  const filtered = useMemo(
    () => activities.filter((a) => {
      const d = new Date(a.startTime);
      return d >= start && d <= end;
    }),
    [activities, start, end],
  );

  const period: Period = mode === "all" ? "all" : mode;
  const stats = computeStats(activities, period, bike, start, end);
  const daily = toDailyPoints(filtered, bike);

  return (
    <>
      {/* View mode tabs */}
      <div className="flex items-center gap-1.5 mb-4 bg-secondary/50 rounded-lg p-1 w-fit">
        {VIEW_MODES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => handleModeChange(v.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
              mode === v.key
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Period picker */}
      {mode !== "all" && (
        <div className="mb-6">
          <PeriodPicker
            mode={mode}
            label={label}
            offset={offset}
            onSelect={setOffset}
          />
        </div>
      )}

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
            <KpiCard label="Rides/Day" value={stats.avgRidesPerDay.toFixed(2)} color="text-blue-300" />
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
