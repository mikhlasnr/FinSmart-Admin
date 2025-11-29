"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { Toolbar } from "./toolbar"
import { EditorContainer } from "./editor-container"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  error?: string
  showToolbar?: boolean
  minHeight?: string
  maxHeight?: string
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  error,
  showToolbar = true,
  minHeight = "200px",
  maxHeight = "400px",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[200px]",
      },
    },
  })

  // Update editor content when content prop changes (for edit mode)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "")
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border rounded-md",
          error ? "border-red-500" : "border-input",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
      >
        {showToolbar && <Toolbar editor={editor} />}
        <EditorContainer
          editor={editor}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

