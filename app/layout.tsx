import type { Metadata } from "next"
import "./globals.css" // Make sure this imports the NEW globals.css
import { Plus_Jakarta_Sans } from "next/font/google"
import { ReactQueryProvider } from "../components/react-query-provider";
import { MainNav } from "@/components/main-nav" // Assuming MainNav is correctly refactored below
import { ClientLayout } from "./client-layout" // Keep this if it handles theme switching or other client logic
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/providers/auth-provider";

// Font setup remains the same - applies --font-sans variable
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans", // Make sure tailwind.config.js uses this variable for font-sans
})

export const metadata: Metadata = {
  title: "CardTracker",
  description: "Track your credit card expenses and manage statement cycles",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Providers remain unchanged
    <ReactQueryProvider>
      <AuthProvider>
        <html lang="en" suppressHydrationWarning>
          {/*
            Applying font variable and base classes.
            The actual background/text colors come from the new globals.css body styles.
            Ensure your tailwind.config.js is updated as discussed previously
            to correctly map the `font-sans` utility to `var(--font-sans)`.
          */}
          <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
            {/* ClientLayout kept assuming it's needed */}
            <ClientLayout>
              <MainNav /> {/* Render the refactored MainNav */}
              <main className="py-6 sm:py-8"> {/* Adjusted padding slightly, check visuals */}
                {/* Container for page content */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </ClientLayout>
            <Toaster /> {/* Keep Toaster */}
          </body>
        </html>
        {/* Removed duplicate Toaster that was outside <html> */}
      </AuthProvider>
    </ReactQueryProvider>
  )
}