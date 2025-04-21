"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"; // Added useState
import { cn } from "@/lib/utils"
import { Home, CreditCard, LayoutList, Settings, Menu, X } from "lucide-react" // Added Menu and X icons
import { Button } from "@/components/ui/button"; // Import Button
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose, // Import SheetClose for closing on link click
  SheetDescription // Import SheetDescription for accessibility
} from "@/components/ui/sheet" // Import Sheet components

export function MainNav() {
  const pathname = usePathname();
  // State to control Sheet (mobile menu) open/close
  // We can let the Sheet component manage its own open state via the trigger/close
  // Or manage it manually if more control is needed, but Sheet handles basics well.

  const navItems = [
    { title: "Home", href: "/", icon: Home },
    { title: "Cards", href: "/cards", icon: CreditCard },
    { title: "Transactions", href: "/transactions", icon: LayoutList },
    { title: "Settings", href: "/settings", icon: Settings }
  ];

  // Helper component for Nav Links to avoid repetition
  const NavLink = ({ item, isMobile = false }: { item: typeof navItems[0], isMobile?: boolean }) => {
    const Icon = item.icon;
    const linkContent = (
        <>
            <Icon className="h-4 w-4" />
            <span>{item.title}</span>
        </>
    );
    const baseClasses = "flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors";
    const activeClasses = "bg-[#F5E3E0] text-[#6E4555]"; // Your active style
    const inactiveClasses = "text-muted-foreground hover:bg-[#F5E3E0]/80 hover:text-[#6E4555]"; // Your inactive style

    const linkClasses = cn(
        baseClasses,
        pathname === item.href ? activeClasses : inactiveClasses,
        isMobile ? "w-full justify-start text-base" : "" // Mobile specific styles
    );

    if (isMobile) {
        // Use SheetClose to automatically close the sheet when a link is clicked
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
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm"> {/* Adjusted z-index */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / Title */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-[#D282A6]" />
            <span className="text-lg font-semibold">CardTracker</span>
          </Link>
        </div>

        {/* Desktop Navigation (Hidden on small screens) */}
        <nav className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4"> {/* Adjusted spacing */}
          {navItems.map((item) => (
            <NavLink key={`desktop-${item.href}`} item={item} />
          ))}
        </nav>

        {/* Mobile Menu Button (Visible only on small screens) */}
        <div className="md:hidden"> {/* Container for the trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open main menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left"> {/* Or side="right" */}
              <SheetHeader className="border-b pb-4 mb-4">
                 {/* Optional: Add Logo/Title inside mobile menu */}
                 <SheetTitle className="text-left">
                     <Link href="/" className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-[#D282A6]" />
                        <span className="text-base font-semibold">CardTracker</span>
                     </Link>
                 </SheetTitle>
                 <SheetDescription className="text-left text-sm text-muted-foreground pt-1">
                    Navigate through your CardTracker application.
                 </SheetDescription>
              </SheetHeader>
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col gap-3"> {/* Use gap for spacing */}
                {navItems.map((item) => (
                   <NavLink key={`mobile-${item.href}`} item={item} isMobile={true} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}