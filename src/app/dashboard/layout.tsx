import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardBackground } from "@/components/dashboard-background";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.error === "RefreshTokenError") {
    redirect("/login");
  }

  return (
    <div className="relative flex-1">
      <DashboardBackground />
      <div className="relative z-10 px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl">
          <DashboardHeader />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
