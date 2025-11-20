"use client"

import { AdminGuard } from "@/components/admin-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, BookOpen, FileText, Tag, Calendar } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Skip layout for login page
  if (pathname === "/login") {
    return <>{children}</>
  }

  const navItems = [
    { href: "/modules", label: "Modules", icon: BookOpen },
    { href: "/categories", label: "Event Categories", icon: Tag },
    { href: "/events", label: "Events", icon: Calendar },
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <nav className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
                    FinSmart Admin
                  </h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive
                          ? "border-[hsl(var(--primary))] text-[hsl(var(--foreground))]"
                          : "border-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))]"
                          }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center">
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}

