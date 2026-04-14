import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { BikeImage } from "@/components/bike-image";
import { metersToKm, formatDate } from "@/lib/utils";
import type { BoschBike } from "@/types/bosch";

interface BikeInfoCardProps {
  bike: BoschBike;
}

export function BikeInfoCard({ bike }: BikeInfoCardProps) {
  const bikeImageUrl = process.env.BIKE_IMAGE_URL || null;

  return (
    <Link href="/dashboard/bike">
      <Card className="bg-card border-border hover:border-emerald-500/30 transition-colors cursor-pointer group">
        <CardContent className="flex items-center gap-6 py-4">
          {/* Bike image */}
          <div className="hidden sm:block shrink-0 w-28 h-20 relative">
            <BikeImage url={bikeImageUrl} alt={bike.name || "eBike"} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate">
              {bike.driveUnit.productName ?? bike.name ?? "My eBike"}
            </h2>
            <p className="text-xs text-muted-foreground truncate">
              {bike.batteries[0]?.productName ?? ""}{" "}
              {bike.remoteControl?.productName ? `· ${bike.remoteControl.productName}` : ""}
            </p>
            {bike.createdAt && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Registered {formatDate(bike.createdAt)}
              </p>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Odometer</p>
              <p className="font-semibold tabular-nums text-blue-400">{metersToKm(bike.driveUnit.odometer)} km</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Battery</p>
              <p className="font-semibold tabular-nums text-emerald-400">{bike.batteries[0]?.productName?.replace("PowerTube ", "") ?? bike.batteries.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Modes</p>
              <p className="font-semibold tabular-nums text-amber-400">{bike.driveUnit.activeAssistModes.length}</p>
            </div>
          </div>

          {/* Arrow */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-emerald-400 transition-colors shrink-0"><path d="m9 18 6-6-6-6"/></svg>
        </CardContent>
      </Card>
    </Link>
  );
}
