"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import type { BoschActivityDetail } from "@/types/bosch";

interface ElevationProfileProps {
  details: BoschActivityDetail[];
}

const COLORS = {
  dark: { bg: "#111827", grid: "#1e293b", label: "#64748b", line: "#22c55e", fillTop: "rgba(34,197,94,0.3)", fillBot: "rgba(34,197,94,0.02)" },
  light: { bg: "#ffffff", grid: "#e2e8f0", label: "#94a3b8", line: "#16a34a", fillTop: "rgba(22,163,74,0.2)", fillBot: "rgba(22,163,74,0.02)" },
};

export function ElevationProfile({ details }: ElevationProfileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  const points = details
    .filter((d) => d.altitude != null && d.distance != null)
    .map((d) => ({ dist: (d.distance ?? 0) / 1000, alt: d.altitude! }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = resolvedTheme === "dark" ? COLORS.dark : COLORS.light;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const alts = points.map((p) => p.alt);
    const minAlt = Math.min(...alts);
    const maxAlt = Math.max(...alts);
    const maxDist = points[points.length - 1].dist;
    const altRange = maxAlt - minAlt || 1;

    const padLeft = 40, padRight = 12, padTop = 12, padBottom = 24;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const toX = (dist: number) => padLeft + (dist / maxDist) * plotW;
    const toY = (alt: number) => padTop + plotH - ((alt - minAlt) / altRange) * plotH;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    // Grid lines + labels
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    const altSteps = 4;
    for (let i = 0; i <= altSteps; i++) {
      const alt = minAlt + (altRange / altSteps) * i;
      const y = toY(alt);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillStyle = c.label;
      ctx.font = "10px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${alt.toFixed(0)}m`, padLeft - 6, y + 3);
    }

    const distSteps = Math.min(5, Math.ceil(maxDist));
    ctx.textAlign = "center";
    for (let i = 0; i <= distSteps; i++) {
      const dist = (maxDist / distSteps) * i;
      ctx.fillStyle = c.label;
      ctx.fillText(`${dist.toFixed(1)}`, toX(dist), h - 6);
    }
    ctx.fillText("km", w - padRight, h - 6);

    // Fill
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    gradient.addColorStop(0, c.fillTop);
    gradient.addColorStop(1, c.fillBot);

    const step = Math.max(1, Math.floor(points.length / 300));
    ctx.beginPath();
    ctx.moveTo(toX(points[0].dist), toY(points[0].alt));
    for (let i = step; i < points.length; i += step) {
      ctx.lineTo(toX(points[i].dist), toY(points[i].alt));
    }
    ctx.lineTo(toX(points[points.length - 1].dist), toY(points[points.length - 1].alt));
    ctx.lineTo(toX(points[points.length - 1].dist), padTop + plotH);
    ctx.lineTo(toX(points[0].dist), padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(toX(points[0].dist), toY(points[0].alt));
    for (let i = step; i < points.length; i += step) {
      ctx.lineTo(toX(points[i].dist), toY(points[i].alt));
    }
    ctx.lineTo(toX(points[points.length - 1].dist), toY(points[points.length - 1].alt));
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [points, resolvedTheme]);

  if (points.length < 2) return null;

  const alts = points.map((p) => p.alt);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Elevation Profile</h3>
        <div className="flex gap-3 text-[11px] text-muted-foreground">
          <span>Min <span className="text-foreground font-semibold">{Math.min(...alts).toFixed(0)}m</span></span>
          <span>Max <span className="text-foreground font-semibold">{Math.max(...alts).toFixed(0)}m</span></span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full h-32 md:h-40 rounded-lg block" />
    </div>
  );
}
