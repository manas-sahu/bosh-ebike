import type { BoschBike, BoschActivitySummary } from "@/types/bosch";

/** Known battery capacities by product name */
const CAPACITY_MAP: Record<string, number> = {
  "PowerTube 800": 800,
  "PowerTube 750": 750,
  "PowerTube 625": 625,
  "PowerTube 500": 500,
  "PowerTube 400": 400,
  "PowerPack 800": 800,
  "PowerPack 500": 500,
  "PowerPack 400": 400,
};

const DEFAULT_CAPACITY = 800;

/**
 * Bosch Performance Line CX effective motor multiplier.
 * This accounts for: motor assist (Eco 60%, Tour 140%, Sport 240%, Turbo 340%),
 * drivetrain losses (~15-20%), and controller overhead.
 * Calibrated against real ride data: 13.9 km ride with 55W avg rider power
 * consumed 136 Wh (17% of 800 Wh battery). This multiplier of 2.8 gives 131.7 Wh (16.5%).
 */
const MOTOR_MULTIPLIER = 2.8;

/** Base system draw in watts (display, connectivity, controller) */
const SYSTEM_DRAW_W = 10;

export function getBatteryCapacity(bike: BoschBike): number {
  const name = bike.batteries[0]?.productName;
  if (name) {
    for (const [key, val] of Object.entries(CAPACITY_MAP)) {
      if (name.includes(key)) return val;
    }
  }
  return DEFAULT_CAPACITY;
}

/** Calculate average Wh per km from lifetime data */
export function getWhPerKm(bike: BoschBike): number {
  const totalWh = bike.batteries[0]?.deliveredWhOverLifetime ?? 0;
  const totalMeters = bike.driveUnit.odometer;
  const totalKm = totalMeters / 1000;
  if (totalKm <= 0 || totalWh <= 0) return 0;
  return totalWh / totalKm;
}

export interface RideConsumption {
  estimatedWh: number;
  estimatedPercent: number;
  whPerKm: number;
}

/**
 * Estimate battery consumption for a single ride.
 *
 * Uses ride-specific data (rider power, duration, elevation) rather than
 * a flat Wh/km average, so hilly/powerful rides show higher consumption.
 *
 * Formula:
 *   Motor Wh  = riderPower_avg * duration_hours * MOTOR_MULTIPLIER
 *   System Wh = SYSTEM_DRAW_W * duration_hours
 *   Climb Wh  = elevationGain * bike_mass_kg * 9.81 / 3600
 *   Total     = Motor + System + Climb
 *
 * Calibrated against real data: 13.9 km, 55W avg, +43m, 47 min → 136 Wh actual.
 */
export function estimateRideConsumption(
  bike: BoschBike,
  activity: BoschActivitySummary,
): RideConsumption {
  const capacity = getBatteryCapacity(bike);
  const distKm = activity.distance / 1000;

  if (distKm <= 0) {
    return { estimatedWh: 0, estimatedPercent: 0, whPerKm: 0 };
  }

  const durationHours = activity.durationWithoutStops / 3600;

  // Motor energy: rider power amplified by motor
  const riderWh = activity.riderPower.average * durationHours;
  const motorWh = riderWh * MOTOR_MULTIPLIER;

  // System overhead: display, connectivity, controller
  const systemWh = SYSTEM_DRAW_W * durationHours;

  // Elevation cost: ~30 kg (bike+motor) * gravity * height / 3600
  const elevationWh = (activity.elevation.gain * 30 * 9.81) / 3600;

  const estimatedWh = motorWh + systemWh + elevationWh;
  const whPerKm = estimatedWh / distKm;
  const estimatedPercent = capacity > 0 ? (estimatedWh / capacity) * 100 : 0;

  return { estimatedWh, estimatedPercent, whPerKm };
}

/** Estimate remaining battery based on reachable range (from assist modes) */
export function estimateCurrentCharge(bike: BoschBike): {
  estimatedPercent: number | null;
  basedOn: string;
} {
  const whPerKm = getWhPerKm(bike);
  if (whPerKm <= 0) return { estimatedPercent: null, basedOn: "" };

  const capacity = getBatteryCapacity(bike);
  // Use the highest-range mode (sorted by range descending, skip "Off")
  const modes = bike.driveUnit.activeAssistModes
    .filter((m) => m.reachableRange != null && m.reachableRange > 0)
    .sort((a, b) => (b.reachableRange ?? 0) - (a.reachableRange ?? 0));

  const ecoMode = modes[0];
  if (!ecoMode?.reachableRange) return { estimatedPercent: null, basedOn: "" };

  // reachableRange * whPerKm = estimated Wh remaining
  const estimatedWhRemaining = ecoMode.reachableRange * whPerKm;
  const estimatedPercent = Math.min((estimatedWhRemaining / capacity) * 100, 100);

  return {
    estimatedPercent,
    basedOn: ecoMode.name,
  };
}
