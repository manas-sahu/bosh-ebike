"use client";

import { GradientDots } from "@/components/ui/gradient-dots";

export function DashboardBackground() {
  return (
    <GradientDots
      duration={40}
      colorCycleDuration={10}
      dotSize={6}
      spacing={12}
      className="opacity-30 pointer-events-none fixed inset-0 z-0"
    />
  );
}
