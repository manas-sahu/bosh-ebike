import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    <div className="flex-1 px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">{children}</div>
    </div>
  );
}
