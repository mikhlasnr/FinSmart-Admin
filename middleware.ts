import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Route yang memerlukan autentikasi (kecuali /login)
  const protectedRoutes = ["/modules", "/categories", "/events"]
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Cek jika mengakses route yang dilindungi (kecuali /login)
  if (isProtectedRoute && pathname !== "/login") {
    // Cek token di cookies atau localStorage (akan dicek di client-side juga)
    // Di sini kita hanya redirect, validasi sebenarnya dilakukan di client-side
    const token = request.cookies.get("auth-token")

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/:path*",
}

