import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { metersToKm, formatDate } from "@/lib/utils";
import type { BoschBike } from "@/types/bosch";

interface BikeDetailsCardProps {
  bike: BoschBike;
}

export function BikeDetailsCard({ bike }: BikeDetailsCardProps) {
  const du = bike.driveUnit;
  const bat = bike.batteries[0];
  const rc = bike.remoteControl;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Drive Unit */}
      <SectionCard
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m-7-7h6m6 0h6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24m0-15.56l-4.24 4.24m-7.08 7.08l-4.24 4.24"/></svg>}
        iconColor="text-emerald-400"
        title="Drive Unit"
        subtitle={du.productName ?? "Unknown"}
      >
        <MetricGrid>
          <Metric label="Odometer" value={`${metersToKm(du.odometer)} km`} color="text-emerald-400" />
          <Metric label="Max Assist" value={`${du.maximumAssistanceSpeed} km/h`} color="text-amber-400" />
          <Metric label="Motor Hours" value={`${du.powerOnTime.total}h`} color="text-blue-400" />
          <Metric label="Assisted Hours" value={`${du.powerOnTime.withMotorSupport}h`} color="text-cyan-400" />
          {du.walkAssistConfiguration && (
            <Metric label="Walk Assist" value={du.walkAssistConfiguration.isEnabled ? `${du.walkAssistConfiguration.maximumSpeed} km/h` : "Off"} color="text-purple-400" />
          )}
          {du.rearWheelCircumferenceUser && (
            <Metric label="Wheel Circ." value={`${du.rearWheelCircumferenceUser} mm`} color="text-muted-foreground" />
          )}
        </MetricGrid>
        <IdRows>
          <IdRow label="Serial" value={du.serialNumber} />
          <IdRow label="Part No." value={du.partNumber} />
        </IdRows>
      </SectionCard>

      {/* Battery */}
      {bat && (
        <SectionCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>}
          iconColor="text-amber-400"
          title="Battery"
          subtitle={bat.productName ?? "Unknown"}
        >
          <MetricGrid>
            <Metric label="Lifetime Energy" value={`${bat.deliveredWhOverLifetime.toLocaleString()} Wh`} color="text-amber-400" />
            <Metric label="Total Cycles" value={bat.chargeCycles.total.toFixed(1)} color="text-cyan-400" />
            <Metric label="On-Bike" value={String(bat.chargeCycles.onBike)} color="text-emerald-400" />
            <Metric label="Off-Bike" value={String(bat.chargeCycles.offBike)} color="text-muted-foreground" />
          </MetricGrid>
          <IdRows>
            <IdRow label="Serial" value={bat.serialNumber} />
            <IdRow label="Part No." value={bat.partNumber} />
          </IdRows>
        </SectionCard>
      )}

      {/* Remote Control */}
      {rc && (
        <SectionCard
          icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
          iconColor="text-purple-400"
          title="Remote Control"
          subtitle={rc.productName ?? "Unknown"}
        >
          <IdRows>
            <IdRow label="Serial" value={rc.serialNumber} />
            <IdRow label="Part No." value={rc.partNumber} />
          </IdRows>
        </SectionCard>
      )}

      {/* General */}
      <SectionCard
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>}
        iconColor="text-cyan-400"
        title="General"
        subtitle={bike.name ?? "eBike"}
      >
        <MetricGrid>
          {bike.createdAt && (
            <Metric label="Registered" value={formatDate(bike.createdAt)} color="text-blue-400" />
          )}
          {bike.language && (
            <Metric label="Language" value={bike.language.toUpperCase()} color="text-muted-foreground" />
          )}
          {bike.serviceDue && (
            <Metric label="Next Service" value={`${metersToKm(bike.serviceDue.odometer)} km`} color="text-red-400" />
          )}
        </MetricGrid>
        <IdRows>
          <IdRow label="Bike ID" value={bike.id} />
        </IdRows>
      </SectionCard>
    </div>
  );
}

function SectionCard({
  icon,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-4 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-secondary ${iconColor}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function IdRows({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1 pt-1 border-t border-border">
      {children}
    </div>
  );
}

function IdRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-[11px] font-mono text-muted-foreground truncate">{value}</span>
    </div>
  );
}
