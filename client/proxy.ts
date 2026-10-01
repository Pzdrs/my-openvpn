import { Route } from "@/lib/route";
import { NextRequest, NextResponse } from "next/server";
import { CookieName } from "./lib/enum";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

const protectedRoutes = [Route.dashboard()];
const publicRoutes = [Route.login()];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const isAuthenticated =
    request.cookies.get(CookieName.IsAuthenticated)?.value === "true";


  if (!isAuthenticated && isProtectedRoute) {
    return NextResponse.redirect(new URL(Route.login(), request.url));
  }

  if (isAuthenticated && isPublicRoute && path !== Route.dashboard()) {
    return NextResponse.redirect(new URL(Route.dashboard(), request.url));
  }

  return NextResponse.next();
}
