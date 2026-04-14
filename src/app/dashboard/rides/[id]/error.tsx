"use client";

import Link from "next/link";
import { ErrorCard } from "@/components/error-card";

export default function RideDetailError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/rides"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Back to All Rides
      </Link>
      <ErrorCard
        title="Failed to load ride"
        message="Could not fetch ride details. Please try again."
        onRetry={unstable_retry}
      />
    </div>
  );
}
