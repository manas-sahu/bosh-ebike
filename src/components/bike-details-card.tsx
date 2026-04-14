import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          eBike Hardware Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drive Unit */}
        <Section title="Drive Unit" color="text-emerald-400">
          <DetailRow label="Product" value={du.productName} />
          <DetailRow label="Serial Number" value={du.serialNumber} mono />
          <DetailRow label="Part Number" value={du.partNumber} mono />
          <DetailRow label="Odometer" value={`${metersToKm(du.odometer)} km`} />
          <DetailRow label="Max Assist Speed" value={`${du.maximumAssistanceSpeed} km/h`} />
          <DetailRow label="Motor Hours (Total)" value={`${du.powerOnTime.total} h`} />
          <DetailRow label="Motor Hours (Assisted)" value={`${du.powerOnTime.withMotorSupport} h`} />
          {du.rearWheelCircumferenceUser && (
            <DetailRow label="Rear Wheel Circumference" value={`${du.rearWheelCircumferenceUser} mm`} />
          )}
          {du.walkAssistConfiguration && (
            <>
              <DetailRow label="Walk Assist" value={du.walkAssistConfiguration.isEnabled ? "Enabled" : "Disabled"} />
              <DetailRow label="Walk Assist Speed" value={`${du.walkAssistConfiguration.maximumSpeed} km/h`} />
            </>
          )}
        </Section>

        <Separator className="bg-border" />

        {/* Battery */}
        {bat && (
          <>
            <Section title="Battery" color="text-amber-400">
              <DetailRow label="Product" value={bat.productName} />
              <DetailRow label="Serial Number" value={bat.serialNumber} mono />
              <DetailRow label="Part Number" value={bat.partNumber} mono />
              <DetailRow label="Lifetime Energy" value={`${bat.deliveredWhOverLifetime.toLocaleString()} Wh`} />
              <DetailRow label="Charge Cycles (Total)" value={String(bat.chargeCycles.total)} />
              <DetailRow label="Charge Cycles (On-Bike)" value={String(bat.chargeCycles.onBike)} />
              <DetailRow label="Charge Cycles (Off-Bike)" value={String(bat.chargeCycles.offBike)} />
            </Section>
            <Separator className="bg-border" />
          </>
        )}

        {/* Remote Control */}
        {rc && (
          <>
            <Section title="Remote Control" color="text-purple-400">
              <DetailRow label="Product" value={rc.productName} />
              <DetailRow label="Serial Number" value={rc.serialNumber} mono />
              <DetailRow label="Part Number" value={rc.partNumber} mono />
            </Section>
            <Separator className="bg-border" />
          </>
        )}

        {/* General */}
        <Section title="General" color="text-cyan-400">
          <DetailRow label="Bike ID" value={bike.id} mono />
          {bike.createdAt && (
            <DetailRow label="Registered" value={formatDate(bike.createdAt)} />
          )}
          {bike.language && (
            <DetailRow label="Language" value={bike.language} />
          )}
          {bike.serviceDue && (
            <DetailRow label="Next Service At" value={`${metersToKm(bike.serviceDue.odometer)} km`} />
          )}
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${color}`}>
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-xs font-medium text-foreground truncate text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
