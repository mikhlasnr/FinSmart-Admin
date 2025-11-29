"use client"

import * as React from "react"
import { Editor } from "@tiptap/core"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react"
import { ToolbarButton } from "./toolbar-button"
import { ToolbarSeparator } from "./toolbar-separator"
import { cn } from "@/lib/utils"

interface ToolbarProps {
  editor: Editor
  className?: string
}

export function Toolbar({ editor, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50",
        className
      )}
    >
      {/* Text Formatting */}
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().toggleBold().run()}
        isActive={(editor) => editor.isActive("bold")}
        disabled={(editor) => !editor.can().chain().focus().toggleBold().run()}
        icon={<Bold className="h-4 w-4" />}
        title="Bold"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().toggleItalic().run()}
        isActive={(editor) => editor.isActive("italic")}
        disabled={(editor) => !editor.can().chain().focus().toggleItalic().run()}
        icon={<Italic className="h-4 w-4" />}
        title="Italic"
      />

      <ToolbarSeparator />

      {/* Headings */}
      <ToolbarButton
        editor={editor}
        onClick={(editor) =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        isActive={(editor) => editor.isActive("heading", { level: 1 })}
        icon={<Heading1 className="h-4 w-4" />}
        title="Heading 1"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        isActive={(editor) => editor.isActive("heading", { level: 2 })}
        icon={<Heading2 className="h-4 w-4" />}
        title="Heading 2"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        isActive={(editor) => editor.isActive("heading", { level: 3 })}
        icon={<Heading3 className="h-4 w-4" />}
        title="Heading 3"
      />

      <ToolbarSeparator />

      {/* Lists */}
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().toggleBulletList().run()}
        isActive={(editor) => editor.isActive("bulletList")}
        icon={<List className="h-4 w-4" />}
        title="Bullet List"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().toggleOrderedList().run()}
        isActive={(editor) => editor.isActive("orderedList")}
        icon={<ListOrdered className="h-4 w-4" />}
        title="Numbered List"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().toggleBlockquote().run()}
        isActive={(editor) => editor.isActive("blockquote")}
        icon={<Quote className="h-4 w-4" />}
        title="Quote"
      />

      <ToolbarSeparator />

      {/* History */}
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().undo().run()}
        disabled={(editor) => !editor.can().chain().focus().undo().run()}
        icon={<Undo className="h-4 w-4" />}
        title="Undo"
      />
      <ToolbarButton
        editor={editor}
        onClick={(editor) => editor.chain().focus().redo().run()}
        disabled={(editor) => !editor.can().chain().focus().redo().run()}
        icon={<Redo className="h-4 w-4" />}
        title="Redo"
      />
    </div>
  )
}

