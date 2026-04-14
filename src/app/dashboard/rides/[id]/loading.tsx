import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RideDetailLoading() {
  return (
    <>
      <div className="pb-6">
        <Skeleton className="h-3 w-28 mb-2" />
        <Skeleton className="h-7 w-56 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Map skeleton */}
      <Skeleton className="h-80 md:h-96 w-full rounded-xl mb-6" />

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="pt-4 pb-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="pt-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
