import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RidesLoading() {
  return (
    <>
      <div className="pb-6">
        <Skeleton className="h-3 w-28 mb-2" />
        <Skeleton className="h-6 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="py-4">
              <div className="flex gap-4">
                <Skeleton className="shrink-0 w-24 h-24 sm:w-32 sm:h-28 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-2.5 w-12" />
                        <Skeleton className="h-3.5 w-10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
