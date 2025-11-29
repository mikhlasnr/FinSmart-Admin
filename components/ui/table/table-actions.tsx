"use client"

import * as React from "react"
import { Button } from "../button"
import { cn } from "@/lib/utils"

interface TableAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

interface TableActionsProps {
  actions: TableAction[]
  className?: string
}

export function TableActions({ actions, className }: TableActionsProps) {
  return (
    <div className={cn("flex justify-end gap-2", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          size={action.size || "sm"}
          onClick={action.onClick}
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  )
}

