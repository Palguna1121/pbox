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
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const isAuthenticated = !!token;

  const authRoutes = ["/login", "/register"];
  const isAuthPage = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuthenticated && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};