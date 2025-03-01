import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Proteksi dashboard yang dimulai dengan /(slash)admin
  if (path.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Route yang diproteksi
  const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin"];

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
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/login", "/register", "/admin/:path*"],
};
