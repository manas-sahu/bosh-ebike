"use client";

import { ErrorCard } from "@/components/error-card";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <ErrorCard
        title="Failed to load dashboard"
        message={
          error.message.includes("401")
            ? "Your session has expired. Please sign in again."
            : "Could not fetch your eBike data. Please try again."
        }
        onRetry={unstable_retry}
      />
    </div>
  );
}
