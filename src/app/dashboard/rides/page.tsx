import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { getBikes, getActivitiesPaginated, getActivityDetails } from "@/lib/bosch-api";
import { RidesListClient } from "@/components/rides-list-client";
import type { BoschActivityDetail } from "@/types/bosch";

const PAGE_SIZE = 10;

export default async function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [bikes, paginated] = await Promise.all([
    getBikes(accessToken),
    getActivitiesPaginated(accessToken, PAGE_SIZE, offset),
  ]);

  const bike = bikes[0];
  const { activities, total } = paginated;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Fetch GPS details for this page's activities
  const detailsMap: Record<string, BoschActivityDetail[]> = {};
  const detailsResults = await Promise.allSettled(
    activities.map((a) =>
      getActivityDetails(accessToken, a.id).then((d) => ({
        id: a.id,
        details: d,
      })),
    ),
  );
  for (const result of detailsResults) {
    if (result.status === "fulfilled") {
      detailsMap[result.value.id] = result.value.details;
    }
  }

  return (
    <>
      <div className="pb-4">
        <h1 className="text-xl font-semibold tracking-tight">All Rides</h1>
        <p className="text-xs text-muted-foreground">{total} rides total</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No rides recorded yet.</p>
        </div>
      ) : (
        <>
          <RidesListClient activities={activities} detailsMap={detailsMap} bike={bike} />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </>
      )}
    </>
  );
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  // Build page numbers: show up to 7 pages with ellipsis
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <a
          href={`/dashboard/rides?page=${currentPage - 1}`}
          className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
        >
          &larr; Prev
        </a>
      ) : (
        <span className="px-3 py-2 text-sm text-muted-foreground/30">
          &larr; Prev
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-sm text-muted-foreground">...</span>
        ) : (
          <a
            key={p}
            href={`/dashboard/rides?page=${p}`}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              p === currentPage
                ? "bg-emerald-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            {p}
          </a>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <a
          href={`/dashboard/rides?page=${currentPage + 1}`}
          className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
        >
          Next &rarr;
        </a>
      ) : (
        <span className="px-3 py-2 text-sm text-muted-foreground/30">
          Next &rarr;
        </span>
      )}
    </nav>
  );
}
