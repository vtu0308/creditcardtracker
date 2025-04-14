"use client"

import { useEffect } from "react"
import { storage } from "@/lib/storage"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize storage when the app first loads
    storage.initialize()
  }, [])

  return (
    <div className="min-h-full bg-[#F5E3E0]">
      {children}
    </div>
  )
} 