"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FitnessTrendChart, EfficiencyChart } from "@/components/stats-charts";
import {
  computePersonalRecords,
  computeFitnessTrend,
  computeEfficiencyRanking,
  computeLifetimeCost,
  computeBatteryHealth,
} from "@/lib/stats";
import type { BoschActivitySummary, BoschBike } from "@/types/bosch";

interface InsightsClientProps {
  activities: BoschActivitySummary[];
  bike?: BoschBike;
}

export function InsightsClient({ activities, bike }: InsightsClientProps) {
  const personalRecords = computePersonalRecords(activities);
  const fitnessTrend = computeFitnessTrend(activities);
  const efficiencyRanking = computeEfficiencyRanking(activities, bike);
  const lifetimeCost = computeLifetimeCost(activities, bike);
  const batteryHealth = computeBatteryHealth(bike);

  if (activities.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No ride data yet. Go ride!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* --- Personal Records --- */}
      {personalRecords.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            Personal Records
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {personalRecords.map((r) => (
              <Card key={r.label} className="bg-card border-border">
                <CardContent className="pt-3 pb-3">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{r.label}</p>
                  <p className="text-lg font-bold tabular-nums">
                    <span className={r.color}>{r.value}</span>
                    <span className="text-xs text-muted-foreground ml-0.5">{r.unit}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate" title={`${r.rideTitle} — ${r.rideDate}`}>
                    {r.rideTitle} — {r.rideDate}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* --- Fitness Trend + Efficiency --- */}
      {(fitnessTrend.length > 1 || efficiencyRanking.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {fitnessTrend.length > 1 && <FitnessTrendChart data={fitnessTrend} />}
          {efficiencyRanking.length > 0 && <EfficiencyChart data={efficiencyRanking} />}
        </section>
      )}

      {/* --- Lifetime Cost + Battery Health --- */}
      {(lifetimeCost.totalWh > 0 || batteryHealth) && (
        <section className="grid gap-4 md:grid-cols-2">
          {lifetimeCost.totalWh > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Lifetime Electricity Cost
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Energy</p>
                  <p className="text-lg font-bold tabular-nums text-orange-400">{lifetimeCost.totalWh.toFixed(0)} <span className="text-xs text-muted-foreground">Wh</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Cost</p>
                  <p className="text-lg font-bold tabular-nums text-emerald-400">{(lifetimeCost.totalCostCents / 100).toFixed(2)} <span className="text-xs text-muted-foreground">EUR</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Cost / Ride</p>
                  <p className="text-sm font-semibold tabular-nums text-blue-400">{(lifetimeCost.costPerRide / 100).toFixed(2)} <span className="text-xs text-muted-foreground">EUR</span></p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Cost / km</p>
                  <p className="text-sm font-semibold tabular-nums text-cyan-400">{(lifetimeCost.costPerKm / 100).toFixed(3)} <span className="text-xs text-muted-foreground">EUR</span></p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Based on {lifetimeCost.electricityRate.toFixed(2)} EUR/kWh</p>
            </div>
          )}

          {batteryHealth && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Battery Health
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Health</span>
                    <span className={`font-semibold ${batteryHealth.healthPercent > 90 ? "text-emerald-400" : batteryHealth.healthPercent > 70 ? "text-amber-400" : "text-red-400"}`}>
                      {batteryHealth.healthPercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={batteryHealth.healthPercent}
                    className={`h-2.5 bg-secondary ${batteryHealth.healthPercent > 90 ? "[&>div]:bg-emerald-500" : batteryHealth.healthPercent > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Effective Capacity</p>
                    <p className="text-sm font-semibold tabular-nums text-emerald-400">{batteryHealth.estimatedCapacity.toFixed(0)} <span className="text-xs text-muted-foreground">Wh</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Rated Capacity</p>
                    <p className="text-sm font-semibold tabular-nums text-muted-foreground">{batteryHealth.ratedCapacity} <span className="text-xs text-muted-foreground">Wh</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Total Cycles</p>
                    <p className="text-sm font-semibold tabular-nums text-cyan-400">{batteryHealth.totalCycles.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Est. Cycles Left</p>
                    <p className="text-sm font-semibold tabular-nums text-blue-400">~{batteryHealth.estimatedCyclesRemaining}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Lifetime Energy</p>
                    <p className="text-sm font-semibold tabular-nums text-amber-400">{batteryHealth.lifetimeWh.toLocaleString()} <span className="text-xs text-muted-foreground">Wh</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Avg Wh/Cycle</p>
                    <p className="text-sm font-semibold tabular-nums text-purple-400">{batteryHealth.avgWhPerCycle.toFixed(0)} <span className="text-xs text-muted-foreground">Wh</span></p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Li-ion fade model: ~80% capacity at 1000 cycles
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
