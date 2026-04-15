import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { BoschBike } from "@/types/bosch";
import { getBatteryCapacity, getWhPerKm } from "@/lib/battery";

interface BatteryCardProps {
  bike: BoschBike;
}

const ESTIMATED_MAX_CYCLES = 1000;

export function BatteryCard({ bike }: BatteryCardProps) {
  const battery = bike.batteries[0];
  if (!battery) return null;

  const capacity = getBatteryCapacity(bike);
  const whPerKm = getWhPerKm(bike);

  const cyclePercent = Math.min(
    (battery.chargeCycles.total / ESTIMATED_MAX_CYCLES) * 100,
    100,
  );
  const healthPercent = Math.max(100 - cyclePercent, 0);

  // Find Turbo mode range
  const turboMode = bike.driveUnit.activeAssistModes
    .filter((m) => m.reachableRange != null && m.reachableRange > 0)
    .sort((a, b) => (a.reachableRange ?? 0) - (b.reachableRange ?? 0))[0];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><rect x="2" y="7" width="16" height="10" rx="2" ry="2" /><line x1="22" y1="11" x2="22" y2="13" /></svg>
          {battery.productName ?? "Battery"}
          <span className="text-[10px] font-normal ml-auto">{capacity} Wh</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Turbo range — the reliable number */}
        {turboMode?.reachableRange != null && (
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Turbo Range</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold tabular-nums text-red-400">
                {turboMode.reachableRange}
              </span>
              <span className="text-lg text-muted-foreground mb-1">km</span>
            </div>
          </div>
        )}

        {/* Battery health */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Battery Health</span>
            <span className={`font-semibold ${healthPercent > 90 ? "text-emerald-400" : healthPercent > 70 ? "text-amber-400" : "text-red-400"}`}>
              {healthPercent.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={healthPercent}
            className={`h-2.5 bg-secondary ${healthPercent > 90 ? "[&>div]:bg-emerald-500" : healthPercent > 70 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricItem label="Lifetime Energy" value={`${battery.deliveredWhOverLifetime.toLocaleString()} Wh`} color="text-amber-400" />
          <MetricItem label="Total Cycles" value={battery.chargeCycles.total.toFixed(1)} color="text-cyan-400" />
          <MetricItem label="Avg Wh/km" value={whPerKm > 0 ? whPerKm.toFixed(1) : "—"} color="text-blue-400" />
          <MetricItem label="On-Bike" value={String(battery.chargeCycles.onBike)} color="text-purple-400" />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${color ?? ""}`}>{value}</p>
    </div>
  );
}
