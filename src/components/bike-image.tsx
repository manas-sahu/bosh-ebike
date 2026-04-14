"use client";

import Image from "next/image";

interface BikeImageProps {
  url?: string | null;
  alt: string;
  className?: string;
}

export function BikeImage({ url, alt, className }: BikeImageProps) {
  if (url) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className={`object-contain ${className ?? ""}`}
        unoptimized
      />
    );
  }

  // Fallback: clean eBike SVG silhouette
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full p-2 ${className ?? ""}`}
    >
      {/* Rear wheel */}
      <circle cx="28" cy="56" r="18" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/40" />
      <circle cx="28" cy="56" r="3" fill="currentColor" className="text-muted-foreground/40" />
      {/* Front wheel */}
      <circle cx="92" cy="56" r="18" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/40" />
      <circle cx="92" cy="56" r="3" fill="currentColor" className="text-muted-foreground/40" />
      {/* Frame */}
      <path d="M28 56 L52 28 L82 28 L92 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60" />
      <path d="M52 28 L28 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-muted-foreground/60" />
      <path d="M52 28 L64 56 L28 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60" />
      {/* Seat */}
      <path d="M48 25 L56 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-muted-foreground/60" />
      {/* Handlebar */}
      <path d="M82 22 L86 28 L82 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60" />
      {/* Motor (circle on bottom bracket) */}
      <circle cx="64" cy="56" r="6" fill="currentColor" className="text-emerald-500/30" />
      <circle cx="64" cy="56" r="3" fill="currentColor" className="text-emerald-500/50" />
      {/* Battery (on downtube) */}
      <rect x="38" y="36" width="20" height="6" rx="2" fill="currentColor" className="text-emerald-500/30" />
    </svg>
  );
}
