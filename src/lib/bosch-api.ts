import "server-only";

import type {
  BoschBike,
  BoschBikesResponse,
  BoschActivitySummary,
  BoschActivitiesResponse,
  BoschActivityDetail,
  BoschActivityDetailsResponse,
} from "@/types/bosch";

const API_BASE = process.env.BOSCH_API_BASE_URL ?? "https://api.bosch-ebike.com";

class BoschApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "BoschApiError";
  }
}

async function boschFetch<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new BoschApiError(
      res.status,
      `Bosch API error: ${res.status} ${res.statusText}`,
    );
  }

  return res.json();
}

export async function getBikes(accessToken: string): Promise<BoschBike[]> {
  const data = await boschFetch<BoschBikesResponse>(
    "/bike-profile/smart-system/v1/bikes",
    accessToken,
  );
  return data.bikes;
}

export interface PaginatedActivities {
  activities: BoschActivitySummary[];
  total: number;
  limit: number;
  offset: number;
}

export async function getRecentActivities(
  accessToken: string,
  limit = 3,
): Promise<BoschActivitySummary[]> {
  const data = await boschFetch<BoschActivitiesResponse>(
    `/activity/smart-system/v1/activities?limit=${limit}&sort=-startTime`,
    accessToken,
  );
  return data.activitySummaries;
}

export async function getActivitiesPaginated(
  accessToken: string,
  limit = 10,
  offset = 0,
): Promise<PaginatedActivities> {
  const data = await boschFetch<BoschActivitiesResponse>(
    `/activity/smart-system/v1/activities?limit=${limit}&offset=${offset}&sort=-startTime`,
    accessToken,
  );
  return {
    activities: data.activitySummaries,
    total: data.pagination.total,
    limit: data.pagination.limit,
    offset: data.pagination.offset,
  };
}

export async function getActivityDetails(
  accessToken: string,
  activityId: string,
): Promise<BoschActivityDetail[]> {
  const data = await boschFetch<BoschActivityDetailsResponse>(
    `/activity/smart-system/v1/activities/${activityId}/details`,
    accessToken,
  );
  return data.activityDetails;
}
