import { NextResponse } from "next/server";

export async function middleware(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const pathname = url.pathname;
  const userAgent = request.headers.get("user-agent") || "Unknown";
  const ipAddress = request.headers.get("x-forwarded-for") || request.ip || "Unknown";

  const headers = new Headers(request.headers);
  headers.set("x-current-path-elevation", origin);

  // Send traffic data to an API route
  fetch(`${origin}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pathname, userAgent, ipAddress }),
  }).catch(() => {}); // Prevent blocking request flow

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
