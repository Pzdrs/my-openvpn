import { isAuthenticated } from "@/lib/auth";
import { NextResponse } from "next/server";

export const config = {
  matcher: '/',
}
 

export function proxy(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.redirect(new URL("/api/v1/auth/login", request.url));
  }
}
