"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  error?: string
  className?: string
}

export function ErrorMessage({ error, className }: ErrorMessageProps) {
  if (!error) return null

  return (
    <p
      className={cn(
        "text-sm font-medium text-red-600",
        className
      )}
      style={{ color: "rgb(220, 38, 38)" }}
    >
      {error}
    </p>
  )
}

