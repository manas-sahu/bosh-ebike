"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshDashboardData } from "@/app/dashboard/actions";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function RefreshBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timeAgo, setTimeAgo] = useState("just now");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doRefresh = useCallback(() => {
    startTransition(async () => {
      await refreshDashboardData();
      router.refresh();
      setLastRefresh(new Date());
    });
  }, [router, startTransition]);

  // Update "time ago" display every 10 seconds
  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - lastRefresh.getTime();
      if (diff < 10_000) setTimeAgo("just now");
      else if (diff < 60_000) setTimeAgo(`${Math.floor(diff / 1000)}s ago`);
      else if (diff < 3_600_000) setTimeAgo(`${Math.floor(diff / 60_000)}m ago`);
      else setTimeAgo(`${Math.floor(diff / 3_600_000)}h ago`);
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [lastRefresh]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(doRefresh, AUTO_REFRESH_INTERVAL);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [autoRefresh, doRefresh]);

  // Pause auto-refresh when tab is hidden
  useEffect(() => {
    if (!autoRefresh) return;
    const handler = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        doRefresh();
        intervalRef.current = setInterval(doRefresh, AUTO_REFRESH_INTERVAL);
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [autoRefresh, doRefresh]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      {/* Last updated */}
      <span className="hidden sm:inline">
        Updated {timeAgo}
      </span>

      {/* Refresh button */}
      <button
        type="button"
        onClick={doRefresh}
        disabled={isPending}
        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
        title="Refresh data"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isPending ? "animate-spin" : ""}
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
        <span className="hidden sm:inline">{isPending ? "Refreshing..." : "Refresh"}</span>
      </button>

      {/* Auto-refresh toggle */}
      <button
        type="button"
        onClick={() => setAutoRefresh(!autoRefresh)}
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
          autoRefresh
            ? "bg-emerald-500/20 text-emerald-400"
            : "hover:bg-secondary"
        }`}
        title={autoRefresh ? "Auto-refresh on (every 5 min)" : "Enable auto-refresh"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className="hidden sm:inline">{autoRefresh ? "Auto: On" : "Auto"}</span>
      </button>
    </div>
  );
}
