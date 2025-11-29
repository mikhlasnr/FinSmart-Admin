"use client"

import * as React from "react"
import { EditorContent } from "@tiptap/react"
import { Editor } from "@tiptap/core"
import { cn } from "@/lib/utils"

interface EditorContainerProps {
  editor: Editor | null
  className?: string
  minHeight?: string
  maxHeight?: string
}

export function EditorContainer({
  editor,
  className,
  minHeight = "200px",
  maxHeight = "400px",
}: EditorContainerProps) {
  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        "overflow-y-auto cursor-text",
        className
      )}
      style={{
        minHeight,
        maxHeight,
      }}
      onClick={() => editor.commands.focus()}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

