"use client"

import { useEffect } from "react"
import { storage } from "@/lib/storage"

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize storage when the app first loads
    storage.initialize()
  }, [])

  return children
} 