import type { Metadata } from "next"
import { Atkinson_Hyperlegible } from "next/font/google"
import "./globals.css"
import { MainNav } from "@/components/main-nav"
import { RootLayoutClient } from "./client-layout"

const atkinson = Atkinson_Hyperlegible({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="en" className="h-full">
      <body className={`${atkinson.className} h-full`}>
        <RootLayoutClient>
          <div className="min-h-full bg-[#F5E3E0]">
            <MainNav />
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </div>
        </RootLayoutClient>
      </body>
    </html>
  )
}
