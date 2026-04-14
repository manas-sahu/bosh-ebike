import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/login-button";
import { BrandLogo } from "@/components/brand-logo";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center space-y-4">
          <BrandLogo variant="logo" size={56} />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              eBike Dashboard
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Real-time metrics from your Bosch Smart System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <LoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Powered by Bosch SingleKey ID
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            View battery health, odometer, assist modes, and ride history
            directly from the EU Data Act API.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://portal.bosch-ebike.com/data-act/app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Data Act Portal
          </a>
          <span className="text-border">|</span>
          <a
            href="https://flow.bosch-ebike.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            eBike Flow
          </a>
        </div>
      </div>
    </div>
  );
}
