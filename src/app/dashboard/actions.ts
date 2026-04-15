"use server";

import { revalidatePath } from "next/cache";

/** Purge cached Bosch API data and re-fetch on next render */
export async function refreshDashboardData() {
  revalidatePath("/dashboard", "layout");
}
