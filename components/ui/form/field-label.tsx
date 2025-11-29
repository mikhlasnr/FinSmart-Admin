"use client"

import * as React from "react"
import { Label } from "../label"
import { cn } from "@/lib/utils"

interface FieldLabelProps {
  label: string
  required?: boolean
  error?: string
  className?: string
}

export function FieldLabel({
  label,
  required,
  error,
  className,
}: FieldLabelProps) {
  return (
    <Label className={cn(error ? "text-red-600" : "", className)}>
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </Label>
  )
}

