// import { auth } from "./lib/auth";
// import { NextResponse } from "next/server";

// export async function middleware(req: any) {
//   const session = await auth(req);
//   const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

//   if (isProtected && !session) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// import { withAuth } from "next-auth/middleware";

// export default withAuth({
//   pages: { signIn: "/login" },
// });

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

// src/middleware.ts
// import { getToken } from "next-auth/jwt";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(req: NextRequest) {
//   const token = await getToken({ req });
//   const isAuthenticated = !!token;

//   const authRoutes = ["/login", "/register"];
//   const isAuthPage = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

//   // Redirect authenticated users away from auth pages
//   if (isAuthenticated && isAuthPage) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   // Redirect unauthenticated users away from protected pages
//   if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/login", "/register"],
// };

// src/middleware.ts
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   const session = request.cookies.get("next-auth.session-token");

//   // Proteksi dashboard
//   if (request.nextUrl.pathname.startsWith("/dashboard") && !session) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*"],
// };

import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Route yang diproteksi
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  // Redirect ke login jika belum login dan mengakses route proteksi
  if (!token && protectedRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect dari auth page jika sudah login
  const authRoutes = ["/login", "/register"];
  if (token && authRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/login", "/register"],
};
