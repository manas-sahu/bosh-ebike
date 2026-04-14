import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { metersToKm, formatHours } from "@/lib/utils";
import type { BoschDriveUnit, BoschServiceDue } from "@/types/bosch";

interface OdometerCardProps {
  driveUnit: BoschDriveUnit;
  serviceDue?: BoschServiceDue;
}

export function OdometerCard({ driveUnit, serviceDue }: OdometerCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
          Odometer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big odometer number */}
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold tabular-nums text-blue-400">
            {metersToKm(driveUnit.odometer)}
          </span>
          <span className="text-lg text-muted-foreground mb-1">km</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <MetricItem label="Motor Hours" value={formatHours(driveUnit.powerOnTime.total)} color="text-cyan-400" />
          <MetricItem label="Assisted" value={formatHours(driveUnit.powerOnTime.withMotorSupport)} color="text-purple-400" />
          <MetricItem label="Max Assist" value={`${driveUnit.maximumAssistanceSpeed} km/h`} color="text-amber-400" />
          {serviceDue && (() => {
            const serviceKm = serviceDue.odometer / 1000;
            const currentKm = driveUnit.odometer / 1000;
            const remaining = serviceKm - currentKm;
            const urgent = remaining < 100;
            return (
              <MetricItem
                label={urgent ? "Service Due!" : "Next Service"}
                value={`${metersToKm(serviceDue.odometer)} km`}
                color={urgent ? "text-red-400" : "text-orange-400"}
              />
            );
          })()}
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
