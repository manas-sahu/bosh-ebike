"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { BoschActivityDetail } from "@/types/bosch";

const TILE_LAYERS = {
  Street: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  Satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  },
  Topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
  },
};

type LayerName = keyof typeof TILE_LAYERS;

function speedToColor(speed: number): string {
  // 0-10 km/h = green, 10-20 = yellow, 20-30+ = red
  const t = Math.min(speed / 30, 1);
  if (t < 0.5) {
    const r = Math.round(255 * (t * 2));
    return `rgb(${r}, 200, 50)`;
  }
  const g = Math.round(200 * (1 - (t - 0.5) * 2));
  return `rgb(255, ${g}, 50)`;
}

interface RideMapProps {
  details: BoschActivityDetail[];
  className?: string;
}

export function RideMap({ details, className }: RideMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const fullMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerName>("Street");

  const points = details
    .filter((d) => d.latitude && d.longitude)
    .map((d) => ({
      lat: d.latitude,
      lng: d.longitude,
      speed: d.speed ?? 0,
      altitude: d.altitude ?? 0,
    }));

  useEffect(() => {
    const container = isFullscreen ? fullMapRef.current : mapRef.current;
    if (!container || points.length < 2) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(container, { zoomControl: true, attributionControl: true });
      mapInstanceRef.current = map;

      const layer = TILE_LAYERS[activeLayer];
      L.tileLayer(layer.url, { attribution: layer.attr, maxZoom: 19 }).addTo(map);

      // Speed-colored polyline segments
      const allLatLngs: [number, number][] = [];
      const step = Math.max(1, Math.floor(points.length / 500));
      for (let i = 0; i < points.length - step; i += step) {
        const p1 = points[i];
        const p2 = points[Math.min(i + step, points.length - 1)];
        const color = speedToColor(p1.speed);
        L.polyline(
          [[p1.lat, p1.lng], [p2.lat, p2.lng]],
          { color, weight: 4, opacity: 0.9, lineCap: "round", lineJoin: "round" },
        ).addTo(map);
        allLatLngs.push([p1.lat, p1.lng]);
      }
      allLatLngs.push([points[points.length - 1].lat, points[points.length - 1].lng]);

      // Start marker
      const startIcon = L.divIcon({
        className: "",
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([points[0].lat, points[0].lng], { icon: startIcon }).addTo(map).bindPopup("Start");

      // End marker
      const endIcon = L.divIcon({
        className: "",
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#dc2626;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([points[points.length - 1].lat, points[points.length - 1].lng], { icon: endIcon })
        .addTo(map)
        .bindPopup("End");

      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [40, 40] });
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [details, isFullscreen, activeLayer]);

  if (points.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-secondary/50 text-muted-foreground text-sm">
        No GPS data available for this ride
      </div>
    );
  }

  const layerButtons = (pos: string) => (
    <div className={`absolute ${pos} z-[1000] flex gap-1 bg-white/90 backdrop-blur rounded-lg p-1 shadow-md`}>
      {(Object.keys(TILE_LAYERS) as LayerName[]).map((name) => (
        <button
          key={name}
          type="button"
          onClick={() => setActiveLayer(name)}
          className={`px-2 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
            activeLayer === name
              ? "bg-emerald-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );

  const speedLegend = (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-3">
      <span className="text-xs font-semibold text-gray-700">Speed</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-medium text-gray-500">0</span>
        <div className="w-36 h-3 rounded-full border border-gray-200" style={{ background: "linear-gradient(to right, rgb(0,200,50), rgb(200,220,50), rgb(255,180,0), rgb(255,80,30), rgb(255,0,50))" }} />
        <span className="text-[11px] font-medium text-gray-500">30+ km/h</span>
      </div>
    </div>
  );

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-[1000] bg-white text-black rounded-lg px-3 py-2 text-sm font-medium shadow-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1.5"
          >
            <ExitFullscreenIcon />
            Exit
          </button>
          {layerButtons("top-4 left-4")}
          {speedLegend}
          <div ref={fullMapRef} className="w-full h-full" />
        </div>
      )}

      {!isFullscreen && (
        <div className={`relative ${className ?? ""}`}>
          <div ref={mapRef} className="h-80 md:h-96 rounded-xl overflow-hidden border border-border" />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 z-[1000] bg-white text-black rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-md cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <FullscreenIcon />
            Fullscreen
          </button>
          {layerButtons("top-3 left-3")}
          {speedLegend}
        </div>
      )}
    </>
  );
}

/** Lightweight static map preview for ride cards */
export function MiniMap({ details }: { details: BoschActivityDetail[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  const points = details
    .filter((d) => d.latitude && d.longitude)
    .map((d) => ({ lat: d.latitude, lng: d.longitude, speed: d.speed ?? 0 }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isDark = resolvedTheme === "dark";
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

    const pad = 6;
    const rangeX = maxLng - minLng || 0.001;
    const rangeY = maxLat - minLat || 0.001;
    const toX = (lng: number) => pad + ((lng - minLng) / rangeX) * (w - pad * 2);
    const toY = (lat: number) => h - pad - ((lat - minLat) / rangeY) * (h - pad * 2);

    ctx.fillStyle = isDark ? "#1e293b" : "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, 8);
    ctx.fill();

    // Speed-colored route
    const step = Math.max(1, Math.floor(points.length / 80));
    for (let i = 0; i < points.length - step; i += step) {
      const p1 = points[i];
      const p2 = points[Math.min(i + step, points.length - 1)];
      ctx.strokeStyle = speedToColor(p1.speed);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(toX(p1.lng), toY(p1.lat));
      ctx.lineTo(toX(p2.lng), toY(p2.lat));
      ctx.stroke();
    }

    // Start dot
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(toX(points[0].lng), toY(points[0].lat), 3, 0, Math.PI * 2);
    ctx.fill();

    // End dot
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(toX(points[points.length - 1].lng), toY(points[points.length - 1].lat), 3, 0, Math.PI * 2);
    ctx.fill();
  }, [points, resolvedTheme]);

  if (points.length < 2) {
    return (
      <div className="w-full h-full rounded-lg bg-secondary/50 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground">No GPS</span>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="w-full h-full rounded-lg block" />;
}

function FullscreenIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>;
}

function ExitFullscreenIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 15 6 6"/><path d="m15 9 6-6"/><path d="M9 15H3v6"/><path d="M9 9H3V3"/></svg>;
}
