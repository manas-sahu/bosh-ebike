"use client";

import { Button } from "@/components/ui/button";
import type { BoschActivityDetail, BoschActivitySummary } from "@/types/bosch";

/** Download a single ride as GPX file */
export function GpxExportButton({
  activity,
  details,
}: {
  activity: BoschActivitySummary;
  details: BoschActivityDetail[];
}) {
  const points = details.filter((d) => d.latitude && d.longitude);

  function handleExport() {
    const date = new Date(activity.startTime).toISOString();
    const title = activity.title || "eBike Ride";

    let trackPoints = "";
    for (const p of points) {
      trackPoints += `        <trkpt lat="${p.latitude}" lon="${p.longitude}">`;
      if (p.altitude != null) trackPoints += `\n          <ele>${p.altitude}</ele>`;
      if (p.speed != null || p.cadence != null || p.riderPower != null) {
        trackPoints += `\n          <extensions>`;
        if (p.speed != null) trackPoints += `\n            <speed>${p.speed}</speed>`;
        if (p.cadence != null) trackPoints += `\n            <cad>${p.cadence}</cad>`;
        if (p.riderPower != null) trackPoints += `\n            <power>${p.riderPower}</power>`;
        trackPoints += `\n          </extensions>`;
      }
      trackPoints += `\n        </trkpt>\n`;
    }

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="eBike Dashboard"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(title)}</name>
    <time>${date}</time>
  </metadata>
  <trk>
    <name>${escapeXml(title)}</name>
    <trkseg>
${trackPoints}    </trkseg>
  </trk>
</gpx>`;

    const dateStr = activity.startTime.slice(0, 10);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    download(gpx, `${dateStr}-${slug}.gpx`, "application/gpx+xml");
  }

  if (points.length === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer text-xs"
      onClick={handleExport}
    >
      <DownloadIcon />
      Export GPX
    </Button>
  );
}

/** Download all rides as CSV */
export function CsvExportButton({
  activities,
}: {
  activities: BoschActivitySummary[];
}) {
  function handleExport() {
    const headers = [
      "Title",
      "Date",
      "Distance (km)",
      "Duration (min)",
      "Avg Speed (km/h)",
      "Max Speed (km/h)",
      "Avg Power (W)",
      "Max Power (W)",
      "Avg Cadence (rpm)",
      "Max Cadence (rpm)",
      "Elevation Gain (m)",
      "Elevation Loss (m)",
      "Calories (kcal)",
      "Difficulty (m/km)",
    ];

    const rows = activities.map((a) => {
      const distKm = a.distance / 1000;
      const difficulty = distKm > 0 ? (a.elevation.gain / distKm).toFixed(1) : "0";
      return [
        escapeCsv(a.title || "Untitled"),
        a.startTime.slice(0, 10),
        (a.distance / 1000).toFixed(2),
        (a.durationWithoutStops / 60).toFixed(1),
        a.speed.average.toFixed(1),
        a.speed.maximum.toFixed(1),
        a.riderPower.average.toFixed(0),
        a.riderPower.maximum.toFixed(0),
        a.cadence.average.toFixed(0),
        a.cadence.maximum.toFixed(0),
        a.elevation.gain.toFixed(0),
        a.elevation.loss.toFixed(0),
        a.caloriesBurned.toFixed(0),
        difficulty,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    download(csv, "ebike-rides.csv", "text/csv");
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer text-xs"
      onClick={handleExport}
    >
      <DownloadIcon />
      Export CSV
    </Button>
  );
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 4180 CSV escaping + Excel formula injection prevention */
function escapeCsv(s: string): string {
  // Prevent Excel formula injection: prefix with ' if starts with =, +, -, @, \t, \r
  let safe = s;
  if (/^[=+\-@\t\r]/.test(safe)) {
    safe = "'" + safe;
  }
  // Escape double quotes and wrap in quotes
  return `"${safe.replace(/"/g, '""')}"`;
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  );
}
