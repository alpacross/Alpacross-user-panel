import { NextResponse } from "next/server";

const AUTH_COOKIE = "auth";

export function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const isAuth = request.cookies.get(AUTH_COOKIE)?.value === "1";

  const isAuthPage = pathname === "/signin" || pathname === "/signup" || pathname === "/forgot-password" || pathname.startsWith("/auth/");
  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/wallets") ||
    pathname.startsWith("/settings");

  if (!isAuth && isAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname + (request.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  if (isAuth && isAuthPage) {
    const next = searchParams.get("next");
    return NextResponse.redirect(new URL(next || "/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/auth/:path*",
    "/dashboard/:path*",
    "/orders/:path*",
    "/wallets/:path*",
    "/settings/:path*",
  ],
};


