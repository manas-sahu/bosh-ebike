"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => signOut({ redirectTo: "/login" })}
    >
      Sign Out
    </Button>
  );
}
