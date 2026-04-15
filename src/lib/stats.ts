import type { BoschActivitySummary, BoschBike } from "@/types/bosch";
import { estimateRideConsumption, getBatteryCapacity } from "@/lib/battery";

export type Period = "week" | "month" | "year" | "all";

export interface PeriodStats {
  label: string;
  period: Period;
  startDate: Date;
  endDate: Date;
  rides: number;
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCalories: number;
  totalElevationGain: number;
  totalElevationLoss: number;
  totalEstimatedWh: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  avgPowerW: number;
  maxPowerW: number;
  avgCadence: number;
  avgDistPerRideKm: number;
  avgRidesPerDay: number;
  avgDifficultyMPerKm: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  distanceKm: number;
  durationMin: number;
  calories: number;
  rides: number;
  avgSpeed: number;
  avgPower: number;
  elevationGain: number;
  estimatedWh: number;
}

function formatRangeLabel(start: Date, end: Date, period: Period): string {
  if (period === "month") {
    return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  if (period === "year") {
    return String(start.getFullYear());
  }
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  const start = new Date(d);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function getPeriodRange(period: Period, now = new Date()): { start: Date; end: Date; label: string } {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  switch (period) {
    case "week": {
      const start = startOfWeek(now);
      return { start, end, label: "This Week" };
    }
    case "month": {
      const start = startOfMonth(now);
      return {
        start,
        end,
        label: now.toLocaleString("en-US", { month: "long", year: "numeric" }),
      };
    }
    case "year": {
      const start = startOfYear(now);
      return { start, end, label: String(now.getFullYear()) };
    }
    case "all":
      return { start: new Date(0), end, label: "All Time" };
  }
}

export function filterActivities(
  activities: BoschActivitySummary[],
  period: Period,
): BoschActivitySummary[] {
  const { start, end } = getPeriodRange(period);
  return activities.filter((a) => {
    const d = new Date(a.startTime);
    return d >= start && d <= end;
  });
}

export function computeStats(
  activities: BoschActivitySummary[],
  period: Period,
  bike?: BoschBike,
  customStart?: Date,
  customEnd?: Date,
): PeriodStats {
  const range = getPeriodRange(period);
  const start = customStart ?? range.start;
  const end = customEnd ?? range.end;
  const label = customStart ? formatRangeLabel(start, end, period) : range.label;
  const filtered = activities.filter((a) => {
    const d = new Date(a.startTime);
    return d >= start && d <= end;
  });

  const n = filtered.length;
  if (n === 0) {
    return {
      label, period, startDate: start, endDate: end,
      rides: 0, totalDistanceKm: 0, totalDurationMin: 0, totalCalories: 0,
      totalElevationGain: 0, totalElevationLoss: 0, totalEstimatedWh: 0,
      avgSpeedKmh: 0, maxSpeedKmh: 0, avgPowerW: 0, maxPowerW: 0,
      avgCadence: 0, avgDistPerRideKm: 0, avgRidesPerDay: 0, avgDifficultyMPerKm: 0,
    };
  }

  const totalDistKm = filtered.reduce((s, a) => s + a.distance / 1000, 0);
  const totalDurMin = filtered.reduce((s, a) => s + a.durationWithoutStops / 60, 0);
  const totalCal = filtered.reduce((s, a) => s + a.caloriesBurned, 0);
  const totalElevGain = filtered.reduce((s, a) => s + a.elevation.gain, 0);
  const totalElevLoss = filtered.reduce((s, a) => s + a.elevation.loss, 0);
  const avgSpeed = filtered.reduce((s, a) => s + a.speed.average, 0) / n;
  const maxSpeed = Math.max(...filtered.map((a) => a.speed.maximum));
  const avgPower = filtered.reduce((s, a) => s + a.riderPower.average, 0) / n;
  const maxPower = Math.max(...filtered.map((a) => a.riderPower.maximum));
  const avgCadence = filtered.reduce((s, a) => s + a.cadence.average, 0) / n;
  const avgDifficulty = filtered.reduce((s, a) => {
    const dk = a.distance / 1000;
    return s + (dk > 0 ? a.elevation.gain / dk : 0);
  }, 0) / n;

  let totalWh = 0;
  if (bike) {
    for (const a of filtered) {
      totalWh += estimateRideConsumption(bike, a).estimatedWh;
    }
  }

  const days = Math.max(1, (end.getTime() - start.getTime()) / 86_400_000);

  return {
    label, period, startDate: start, endDate: end,
    rides: n,
    totalDistanceKm: totalDistKm,
    totalDurationMin: totalDurMin,
    totalCalories: totalCal,
    totalElevationGain: totalElevGain,
    totalElevationLoss: totalElevLoss,
    totalEstimatedWh: totalWh,
    avgSpeedKmh: avgSpeed,
    maxSpeedKmh: maxSpeed,
    avgPowerW: avgPower,
    maxPowerW: maxPower,
    avgCadence: avgCadence,
    avgDistPerRideKm: totalDistKm / n,
    avgRidesPerDay: n / days,
    avgDifficultyMPerKm: avgDifficulty,
  };
}

// --- Personal Records ---

export interface PersonalRecord {
  label: string;
  value: string;
  unit: string;
  rideTitle: string;
  rideDate: string;
  color: string;
}

export function computePersonalRecords(
  activities: BoschActivitySummary[],
): PersonalRecord[] {
  if (activities.length === 0) return [];

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const byMax = <T,>(arr: T[], fn: (a: T) => number) =>
    arr.reduce((best, a) => (fn(a) > fn(best) ? a : best), arr[0]);

  const longest = byMax(activities, (a) => a.distance);
  const fastest = byMax(activities, (a) => a.speed.maximum);
  const mostPower = byMax(activities, (a) => a.riderPower.maximum);
  const mostElevation = byMax(activities, (a) => a.elevation.gain);
  const mostCalories = byMax(activities, (a) => a.caloriesBurned);
  const longestDuration = byMax(activities, (a) => a.durationWithoutStops);
  const highestAvgPower = byMax(activities, (a) => a.riderPower.average);
  const highestAvgSpeed = byMax(activities, (a) => a.speed.average);

  return [
    { label: "Longest Ride", value: (longest.distance / 1000).toFixed(1), unit: "km", rideTitle: longest.title, rideDate: fmtDate(longest.startTime), color: "text-emerald-400" },
    { label: "Top Speed", value: fastest.speed.maximum.toFixed(1), unit: "km/h", rideTitle: fastest.title, rideDate: fmtDate(fastest.startTime), color: "text-amber-400" },
    { label: "Peak Power", value: String(mostPower.riderPower.maximum), unit: "W", rideTitle: mostPower.title, rideDate: fmtDate(mostPower.startTime), color: "text-purple-400" },
    { label: "Most Elevation", value: `+${mostElevation.elevation.gain.toFixed(0)}`, unit: "m", rideTitle: mostElevation.title, rideDate: fmtDate(mostElevation.startTime), color: "text-cyan-400" },
    { label: "Most Calories", value: mostCalories.caloriesBurned.toFixed(0), unit: "kcal", rideTitle: mostCalories.title, rideDate: fmtDate(mostCalories.startTime), color: "text-red-400" },
    { label: "Longest Duration", value: String(Math.round(longestDuration.durationWithoutStops / 60)), unit: "min", rideTitle: longestDuration.title, rideDate: fmtDate(longestDuration.startTime), color: "text-blue-400" },
    { label: "Best Avg Power", value: highestAvgPower.riderPower.average.toFixed(0), unit: "W", rideTitle: highestAvgPower.title, rideDate: fmtDate(highestAvgPower.startTime), color: "text-purple-300" },
    { label: "Best Avg Speed", value: highestAvgSpeed.speed.average.toFixed(1), unit: "km/h", rideTitle: highestAvgSpeed.title, rideDate: fmtDate(highestAvgSpeed.startTime), color: "text-amber-300" },
  ];
}

// --- Fitness Trend (per-ride power over time) ---

export interface FitnessTrendPoint {
  date: string;
  rideTitle: string;
  avgPower: number;
  avgSpeed: number;
  avgCadence: number;
}

export function computeFitnessTrend(activities: BoschActivitySummary[]): FitnessTrendPoint[] {
  return activities
    .slice()
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .map((a) => ({
      date: a.startTime.slice(0, 10),
      rideTitle: a.title,
      avgPower: a.riderPower.average,
      avgSpeed: a.speed.average,
      avgCadence: a.cadence.average,
    }));
}

// --- Efficiency Ranking ---

export interface EfficiencyEntry {
  rideTitle: string;
  rideDate: string;
  distanceKm: number;
  estimatedWh: number;
  whPerKm: number;
}

export function computeEfficiencyRanking(
  activities: BoschActivitySummary[],
  bike?: BoschBike,
): EfficiencyEntry[] {
  if (!bike) return [];

  return activities
    .filter((a) => a.distance > 1000) // skip very short rides (<1 km)
    .map((a) => {
      const { estimatedWh, whPerKm } = estimateRideConsumption(bike, a);
      return {
        rideTitle: a.title,
        rideDate: new Date(a.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        distanceKm: a.distance / 1000,
        estimatedWh,
        whPerKm,
      };
    })
    .sort((a, b) => a.whPerKm - b.whPerKm); // most efficient first
}

// --- Lifetime Cost ---

export interface LifetimeCost {
  totalWh: number;
  totalCostCents: number;
  costPerRide: number;
  costPerKm: number;
  electricityRate: number; // €/kWh
}

export function computeLifetimeCost(
  activities: BoschActivitySummary[],
  bike: BoschBike | undefined,
  electricityRate = 0.30, // €/kWh default
): LifetimeCost {
  if (!bike || activities.length === 0) {
    return { totalWh: 0, totalCostCents: 0, costPerRide: 0, costPerKm: 0, electricityRate };
  }

  let totalWh = 0;
  let totalKm = 0;
  for (const a of activities) {
    totalWh += estimateRideConsumption(bike, a).estimatedWh;
    totalKm += a.distance / 1000;
  }

  const totalCostCents = (totalWh / 1000) * electricityRate * 100; // in cents
  const costPerRide = activities.length > 0 ? totalCostCents / activities.length : 0;
  const costPerKm = totalKm > 0 ? totalCostCents / totalKm : 0;

  return { totalWh, totalCostCents, costPerRide, costPerKm, electricityRate };
}

// --- Battery Health ---

export interface BatteryHealth {
  ratedCapacity: number;
  estimatedCapacity: number;
  healthPercent: number;
  totalCycles: number;
  estimatedCyclesRemaining: number;
  lifetimeWh: number;
  avgWhPerCycle: number;
}

export function computeBatteryHealth(bike?: BoschBike): BatteryHealth | null {
  if (!bike) return null;
  const battery = bike.batteries[0];
  if (!battery) return null;

  const ratedCapacity = getBatteryCapacity(bike);
  const cycles = battery.chargeCycles.total;
  const lifetimeWh = battery.deliveredWhOverLifetime;

  // Lithium-ion capacity fade model:
  // ~80% capacity after ~1000 full cycles (linear approximation)
  // healthPercent = 100 - (cycles / 1000) * 20
  const healthPercent = Math.max(100 - (cycles / 1000) * 20, 50);
  const estimatedCapacity = ratedCapacity * (healthPercent / 100);
  const estimatedCyclesRemaining = Math.max(Math.round((1000 - cycles) * 0.8), 0);
  const avgWhPerCycle = cycles > 0 ? lifetimeWh / cycles : 0;

  return {
    ratedCapacity,
    estimatedCapacity,
    healthPercent,
    totalCycles: cycles,
    estimatedCyclesRemaining,
    lifetimeWh,
    avgWhPerCycle,
  };
}

/** Aggregate activities into daily data points for charts */
export function toDailyPoints(
  activities: BoschActivitySummary[],
  bike?: BoschBike,
): DailyPoint[] {
  const map = new Map<string, DailyPoint>();

  for (const a of activities) {
    const date = a.startTime.slice(0, 10);
    const existing = map.get(date);
    const wh = bike ? estimateRideConsumption(bike, a).estimatedWh : 0;

    if (existing) {
      existing.distanceKm += a.distance / 1000;
      existing.durationMin += a.durationWithoutStops / 60;
      existing.calories += a.caloriesBurned;
      existing.rides += 1;
      existing.avgSpeed = (existing.avgSpeed + a.speed.average) / 2;
      existing.avgPower = (existing.avgPower + a.riderPower.average) / 2;
      existing.elevationGain += a.elevation.gain;
      existing.estimatedWh += wh;
    } else {
      map.set(date, {
        date,
        distanceKm: a.distance / 1000,
        durationMin: a.durationWithoutStops / 60,
        calories: a.caloriesBurned,
        rides: 1,
        avgSpeed: a.speed.average,
        avgPower: a.riderPower.average,
        elevationGain: a.elevation.gain,
        estimatedWh: wh,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
