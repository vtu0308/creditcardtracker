import type { Metadata } from "next"
import "./globals.css"
import { Plus_Jakarta_Sans } from "next/font/google"
import { ReactQueryProvider } from "../components/react-query-provider";
import { MainNav } from "@/components/main-nav"
import { ClientLayout } from "./client-layout"
import { Toaster } from "@/components/ui/toaster"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <ReactQueryProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
          <ClientLayout>
            <MainNav />
            <main className="py-4 sm:py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </ClientLayout>
          <Toaster />
        </body>
      </html>
    </ReactQueryProvider>
  )
}
