
import { NextResponse } from "next/server";

export function middleware(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const pathname = url.pathname;
  const headers = new Headers(request.headers);
  headers.set("x-current-path-elevation", origin);
  return NextResponse.next({ headers });
}

export const config = { 
  matcher: [
    // match all routes except static files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};