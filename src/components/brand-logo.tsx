"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface BrandLogoProps {
  /** "icon" = square icon, "logo" = wide logo with text */
  variant?: "icon" | "logo";
  size?: number;
  className?: string;
}

export function BrandLogo({ variant = "icon", size = 32, className }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  if (variant === "logo") {
    const src = isDark ? "/brand/logo-dark.png" : "/brand/logo.png";
    return (
      <Image
        src={src}
        alt="Bosch eBike"
        width={size * 3}
        height={size}
        className={`object-contain ${className ?? ""}`}
        priority
      />
    );
  }

  const src = isDark ? "/brand/icon-dark.png" : "/brand/icon.png";
  return (
    <Image
      src={src}
      alt="Bosch eBike"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
