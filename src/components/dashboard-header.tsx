import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/brand-logo";

export async function DashboardHeader() {
  const session = await auth();

  return (
    <header className="flex items-center justify-between pb-6 mb-2">
      <div className="flex items-center gap-3">
        <BrandLogo size={36} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">eBike Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Hello, {session?.user?.email
              ? session.user.email.split("@")[0]
              : session?.user?.name?.startsWith("skid.")
                ? "Manas"
                : session?.user?.name ?? "Rider"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
