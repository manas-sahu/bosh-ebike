import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/bikes") ||
    pathname.startsWith("/api/activities")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/bikes/:path*", "/api/activities/:path*"],
};
