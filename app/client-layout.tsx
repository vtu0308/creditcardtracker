"use client"

import { useEffect } from "react"
import { storage } from "@/lib/storage"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  // No initialization needed for Supabase storage
  useEffect(() => {}, [])

  return (
    <div className="min-h-full bg-background">
      {children}
    </div>
  )
} 