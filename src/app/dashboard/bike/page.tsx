import { getAccessToken } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBikes } from "@/lib/bosch-api";
import { BikeDetailsCard } from "@/components/bike-details-card";
import { BikeImage } from "@/components/bike-image";

export default async function BikePage() {
  const accessToken = await getAccessToken();
  if (!accessToken) redirect("/login");

  const bikes = await getBikes(accessToken);
  const bike = bikes[0];

  if (!bike) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No eBike found.</p>
        <Link href="/dashboard" className="text-emerald-400 text-sm hover:underline mt-2 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const bikeImageUrl = process.env.BIKE_IMAGE_URL || null;

  return (
    <>
      <div className="pb-6">
        <h1 className="text-2xl font-bold tracking-tight">eBike Details</h1>
      </div>

      {/* Hero image */}
      <div className="flex justify-center mb-8 py-6 rounded-xl bg-card border border-border">
        <div className="relative w-72 h-48">
          <BikeImage url={bikeImageUrl} alt={bike.driveUnit.productName ?? "eBike"} />
        </div>
      </div>

      <BikeDetailsCard bike={bike} />
    </>
  );
}
