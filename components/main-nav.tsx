"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CreditCard, LayoutList, Settings } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Home",
      href: "/",
      icon: Home
    },
    {
      title: "Cards",
      href: "/cards",
      icon: CreditCard
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: LayoutList
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-[#D282A6]" />
            <span className="text-lg font-semibold">CardTracker</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-[#F5E3E0] text-[#6E4555]"
                    : "text-muted-foreground hover:bg-[#F5E3E0] hover:text-[#6E4555]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
} 