"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, CreditCard, LayoutList, Settings, Menu, Sun, Target, TrendingUp, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetDescription
} from "@/components/ui/sheet"

export function MainNav() {
  const pathname = usePathname();

  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Cards", href: "/cards", icon: CreditCard },
    { title: "Transactions", href: "/transactions", icon: LayoutList },
    { title: "Budget", href: "/budget", icon: Target },
    { title: "Net Worth", href: "/net-worth", icon: TrendingUp },
    { title: "Settings", href: "/settings", icon: Settings }
  ];

  // NavLink helper component
  const NavLink = ({ item, isMobile = false }: { item: typeof navItems[0], isMobile?: boolean }) => {
    const Icon = item.icon;
    const linkContent = (
      <>
        <Icon className="h-4 w-4" />
        <span>{item.title}</span>
      </>
    );
    const baseClasses = "flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors font-medium";
    const activeClasses = "text-primary"; // Active: Only primary text color
    const inactiveClasses = "text-muted-foreground hover:bg-primary/10 hover:text-primary"; // Inactive: Muted text, hover bg/text primary

    const linkClasses = cn(
      baseClasses,
      pathname === item.href ? activeClasses : inactiveClasses,
      isMobile ? "w-full justify-start text-base" : ""
    );

    if (isMobile) {
      return (
        <SheetClose asChild>
          <Link href={item.href} className={linkClasses}>
            {linkContent}
          </Link>
        </SheetClose>
      );
    }

    return (
      <Link href={item.href} className={linkClasses}>
        {linkContent}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-4" style={{ borderColor: 'hsl(340, 43%, 66%)' }}>
      <div className="w-full bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Left Column: Logo */}
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: "hsl(340, 43%, 66%)" }}>
                <Banknote className="h-6 w-6 text-white" />
              </span>
              <span className="font-bold text-black">Wealth Manager</span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <nav className="hidden md:flex md:items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <NavLink key={`desktop-${item.href}`} item={item} />
            ))}
          </nav>

          {/* Right: Theme Toggle and Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button variant="ghost" size="icon" disabled>
              <Sun className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* Mobile Menu Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open main menu" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader className="border-b border-border pb-4 mb-4">
                  <SheetTitle className="text-left">
                    <Link href="/" className="flex items-center space-x-2">
                      <span className="flex items-center justify-center h-10 w-10 rounded-lg" style={{ background: "hsl(340, 43%, 66%)", color: "white" }}>
                        <Banknote className="h-6 w-6" />
                      </span>
                      <span className="text-base font-semibold">Wealth Manager</span>
                    </Link>
                  </SheetTitle>
                  <SheetDescription className="text-left text-sm text-muted-foreground pt-1">
                    Navigate through your Wealth Manager application.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <NavLink key={`mobile-${item.href}`} item={item} isMobile={true} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div> {/* End Right Column div */}
        </div> {/* End Grid div */}
      </div> {/* End Background div */}
    </header>
  );
}