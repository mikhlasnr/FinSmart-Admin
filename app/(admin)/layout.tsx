"use client"

import { AdminGuard } from "@/components/admin-guard"
import { AdminNavbar } from "@/components/admin-navbar"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Skip layout for login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminNavbar />
        <main className="max-w-7xl mx-auto pt-20 pb-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}

