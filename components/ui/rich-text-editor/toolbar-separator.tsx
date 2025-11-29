"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToolbarSeparatorProps {
  className?: string
}

export function ToolbarSeparator({ className }: ToolbarSeparatorProps) {
  return <div className={cn("w-px h-6 bg-border mx-1", className)} />
}

