"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <Button
      size="lg"
      className="w-full cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold h-12 text-base transition-colors"
      onClick={() => signIn("bosch", { redirectTo: "/dashboard" })}
    >
      Login with Bosch SingleKey
    </Button>
  );
}
