import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BoschDriveUnit } from "@/types/bosch";
import { getAssistModeLabel, getAssistModeColor } from "@/lib/assist-modes";

interface AssistModesCardProps {
  driveUnit: BoschDriveUnit;
}

export function AssistModesCard({ driveUnit }: AssistModesCardProps) {
  // Sort modes by range descending (most efficient first)
  const sortedModes = [...driveUnit.activeAssistModes].sort(
    (a, b) => (b.reachableRange ?? 0) - (a.reachableRange ?? 0),
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" /></svg>
          Assist Modes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedModes.length > 0 ? (
          <div className="space-y-2">
            {sortedModes.map((mode) => {
              const label = getAssistModeLabel(mode.name);
              const color = getAssistModeColor(mode.name);
              return (
                <div
                  key={mode.name}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2"
                >
                  <span className={`text-sm font-semibold ${color}`}>
                    {label}
                  </span>
                  {mode.reachableRange != null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      ~{mode.reachableRange} km range
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active modes</p>
        )}

        {driveUnit.walkAssistConfiguration && (
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
            <span className="text-sm font-semibold text-muted-foreground">Walk Assist</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {driveUnit.walkAssistConfiguration.maximumSpeed} km/h
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
