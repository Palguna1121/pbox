import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;

  // Daftar route yang diproteksi
  const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin"];

  // Route authentication (login/register)
  const authRoutes = ["/login", "/register"];

  // Cek jika mengakses route yang diproteksi
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // Cek jika mengakses route admin
  const isAdminRoute = path.startsWith("/admin");

  // Redirect ke login jika belum login dan mengakses route proteksi
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect dari auth page jika sudah login
  if (token && authRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteksi route admin
  if (isAdminRoute) {
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/profile/:path*", "/settings/:path*", "/login", "/register"],
};
