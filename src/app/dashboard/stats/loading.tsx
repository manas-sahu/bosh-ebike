import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsLoading() {
  return (
    <>
      <div className="pb-4">
        <Skeleton className="h-3 w-28 mb-2" />
        <Skeleton className="h-6 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Tab skeleton */}
      <Skeleton className="h-10 w-80 rounded-lg mb-6" />

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="pt-3 pb-3 space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-5 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </>
  );
}
