"use client";

import { useState } from "react";
import { RideCardWithMap } from "@/components/ride-card-with-map";
import { CsvExportButton } from "@/components/export-buttons";
import type { BoschActivitySummary, BoschActivityDetail, BoschBike } from "@/types/bosch";

type SortKey = "date" | "distance" | "duration" | "speed" | "power" | "elevation" | "calories" | "difficulty";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "date", label: "Date" },
  { key: "distance", label: "Distance" },
  { key: "duration", label: "Duration" },
  { key: "speed", label: "Speed" },
  { key: "power", label: "Power" },
  { key: "elevation", label: "Elevation" },
  { key: "calories", label: "Calories" },
  { key: "difficulty", label: "Difficulty" },
];

function getSortValue(a: BoschActivitySummary, key: SortKey): number {
  switch (key) {
    case "date": return new Date(a.startTime).getTime();
    case "distance": return a.distance;
    case "duration": return a.durationWithoutStops;
    case "speed": return a.speed.average;
    case "power": return a.riderPower.average;
    case "elevation": return a.elevation.gain;
    case "calories": return a.caloriesBurned;
    case "difficulty": {
      const distKm = a.distance / 1000;
      return distKm > 0 ? a.elevation.gain / distKm : 0;
    }
  }
}

interface RidesListClientProps {
  activities: BoschActivitySummary[];
  detailsMap: Record<string, BoschActivityDetail[]>;
  bike?: BoschBike;
}

export function RidesListClient({ activities, detailsMap, bike }: RidesListClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...activities].sort((a, b) => {
    const va = getSortValue(a, sortKey);
    const vb = getSortValue(b, sortKey);
    return sortAsc ? va - vb : vb - va;
  });

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <>
      {/* Sort bar + CSV export */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSort(opt.key)}
              className={`px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
                sortKey === opt.key
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {opt.label}
              {sortKey === opt.key && (
                <span className="ml-0.5">{sortAsc ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>
        <CsvExportButton activities={activities} />
      </div>

      {/* Rides */}
      <div className="flex flex-col gap-4">
        {sorted.map((activity) => (
          <RideCardWithMap
            key={activity.id}
            activity={activity}
            details={detailsMap[activity.id] ?? []}
            bike={bike}
          />
        ))}
      </div>
    </>
  );
}
