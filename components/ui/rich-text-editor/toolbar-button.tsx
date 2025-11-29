"use client"

import * as React from "react"
import { Editor } from "@tiptap/core"
import { Button } from "../button"
import { cn } from "@/lib/utils"

interface ToolbarButtonProps {
  editor: Editor
  onClick: (editor: Editor) => void
  isActive?: (editor: Editor) => boolean
  disabled?: (editor: Editor) => boolean
  icon: React.ReactNode
  title?: string
  className?: string
}

export function ToolbarButton({
  editor,
  onClick,
  isActive,
  disabled,
  icon,
  title,
  className,
}: ToolbarButtonProps) {
  const active = isActive ? isActive(editor) : false
  const isDisabled = disabled ? disabled(editor) : false

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => onClick(editor)}
      disabled={isDisabled}
      className={cn(active ? "bg-muted" : "", className)}
      title={title}
    >
      {icon}
    </Button>
  )
}

