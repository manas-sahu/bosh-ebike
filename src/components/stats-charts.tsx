"use client";

import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import type { DailyPoint, FitnessTrendPoint, EfficiencyEntry } from "@/lib/stats";

const COLORS = {
  emerald: "#22c55e",
  blue: "#3b82f6",
  amber: "#f59e0b",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  red: "#ef4444",
  orange: "#f97316",
};

interface ChartProps {
  data: DailyPoint[];
}

export function DistanceChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Distance per Day" unit="km">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<CustomTooltip unit="km" />} />
          <Bar dataKey="distanceKm" fill={COLORS.emerald} radius={[4, 4, 0, 0]} name="Distance" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function SpeedPowerChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Avg Speed & Power" unit="">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis yAxisId="speed" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis yAxisId="power" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<DualTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line yAxisId="speed" dataKey="avgSpeed" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3 }} name="Speed (km/h)" />
          <Line yAxisId="power" dataKey="avgPower" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 3 }} name="Power (W)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function CaloriesChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Calories Burned" unit="kcal">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<CustomTooltip unit="kcal" />} />
          <defs>
            <linearGradient id="caloriesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="calories" stroke={COLORS.red} fill="url(#caloriesGrad)" strokeWidth={2} name="Calories" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function ElevationChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Elevation Gain" unit="m">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<CustomTooltip unit="m" />} />
          <Bar dataKey="elevationGain" fill={COLORS.cyan} radius={[4, 4, 0, 0]} name="Elevation" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function BatteryConsumptionChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Est. Battery Consumption" unit="Wh">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<CustomTooltip unit="Wh" />} />
          <defs>
            <linearGradient id="whGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area dataKey="estimatedWh" stroke={COLORS.orange} fill="url(#whGrad)" strokeWidth={2} name="Battery" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export function DurationChart({ data }: ChartProps) {
  return (
    <ChartWrapper title="Ride Duration" unit="min">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<CustomTooltip unit="min" />} />
          <Bar dataKey="durationMin" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Duration" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// --- Fitness Trend Chart ---

export function FitnessTrendChart({ data }: { data: FitnessTrendPoint[] }) {
  return (
    <ChartWrapper title="Fitness Trend — Avg Power per Ride" unit="">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis yAxisId="power" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis yAxisId="cadence" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<FitnessTrendTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line yAxisId="power" dataKey="avgPower" stroke={COLORS.purple} strokeWidth={2} dot={{ r: 3 }} name="Power (W)" />
          <Line yAxisId="cadence" dataKey="avgCadence" stroke={COLORS.cyan} strokeWidth={2} dot={{ r: 3 }} name="Cadence (rpm)" />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

function FitnessTrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const ride = payload[0] as unknown as { payload: FitnessTrendPoint };
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{ride.payload.rideTitle} — {label ? shortDate(label) : ""}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value.toFixed(1)}</p>
      ))}
    </div>
  );
}

// --- Efficiency Chart ---

export function EfficiencyChart({ data }: { data: EfficiencyEntry[] }) {
  // Show top 10 entries with bars
  const top = data.slice(0, 10).map((e) => ({
    ...e,
    label: `${e.rideTitle} (${e.rideDate})`,
  }));

  return (
    <ChartWrapper title="Most Efficient Rides — Wh/km" unit="">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={top} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
          <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
          <Tooltip content={<EfficiencyTooltip />} />
          <Bar dataKey="whPerKm" fill={COLORS.emerald} radius={[0, 4, 4, 0]} name="Wh/km" />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

function EfficiencyTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: EfficiencyEntry & { label: string }; value: number }> }) {
  if (!active || !payload?.length) return null;
  const e = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-1">{e.rideTitle} — {e.rideDate}</p>
      <p><span className="text-emerald-400">{e.whPerKm.toFixed(1)}</span> Wh/km</p>
      <p className="text-muted-foreground">{e.distanceKm.toFixed(1)} km · {e.estimatedWh.toFixed(0)} Wh</p>
    </div>
  );
}

// --- Helpers ---

function ChartWrapper({ title, unit, children }: { title: string; unit: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

function shortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label, unit }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label ? shortDate(label) : ""}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-semibold">{p.value.toFixed(1)} {unit}</p>
      ))}
    </div>
  );
}

function DualTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="text-muted-foreground mb-1">{label ? shortDate(label) : ""}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value.toFixed(1)}</p>
      ))}
    </div>
  );
}
