import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const STAFF_SETTINGS_PATHS = new Set([
  "/shopkeeper/settings",
  "/shopkeeper/settings/profile",
  "/shopkeeper/settings/password",
  "/shopkeeper/settings/support",
]);

const isHiddenCustomerPage = (pathname: string) =>
  pathname === "/customer/dashboard" ||
  pathname.startsWith("/customer/repair-request") ||
  pathname.startsWith("/customer/repair-history");

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const userRole = (token?.role as string)?.toUpperCase();
  const isShopkeeper = userRole === "SHOPKEEPER" || userRole === "STAFF";
  const isStaff = userRole === "STAFF";
  const isUser = userRole === "USER" || userRole === "CUSTOMER";
  const isGuest = !token;

  // Protect shopkeeper routes
  if (pathname.startsWith("/shopkeeper")) {
    if (isGuest && pathname !== "/shopkeeper/scan-device") {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (isUser) {
      const newPath = pathname.replace(/^\/shopkeeper/, "/customer");
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    if (
      isStaff &&
      pathname.startsWith("/shopkeeper/settings") &&
      !STAFF_SETTINGS_PATHS.has(pathname)
    ) {
      return NextResponse.redirect(
        new URL("/shopkeeper/settings/profile", request.url),
      );
    }
  }

  // Protect customer routes
  if (pathname.startsWith("/customer")) {
    if (isGuest) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (isShopkeeper) {
      const newPath = pathname.replace(/^\/customer/, "/shopkeeper");
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    if (isUser && isHiddenCustomerPage(pathname)) {
      return NextResponse.redirect(
        new URL("/customer/search-history", request.url),
      );
    }
  }

  // General dashboard protection
  if (pathname.startsWith("/dashboard")) {
    if (isGuest) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    // Redirect generic dashboard based on role
    if (isShopkeeper) {
      return NextResponse.redirect(
        new URL("/shopkeeper/dashboard", request.url),
      );
    } else if (isUser) {
      return NextResponse.redirect(new URL("/customer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
