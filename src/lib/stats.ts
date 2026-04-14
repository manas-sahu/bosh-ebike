import type { BoschActivitySummary, BoschBike } from "@/types/bosch";
import { estimateRideConsumption } from "@/lib/battery";

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
): PeriodStats {
  const { start, end, label } = getPeriodRange(period);
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
