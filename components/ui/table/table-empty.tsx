"use client"

import * as React from "react"
import { TableCell, TableRow } from "../table"
import { cn } from "@/lib/utils"

interface TableEmptyProps {
  colSpan: number
  message?: string
  className?: string
}

export function TableEmpty({
  colSpan,
  message = "No data available",
  className,
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className={cn(
          "text-center py-8 text-muted-foreground",
          className
        )}
      >
        {message}
      </TableCell>
    </TableRow>
  )
}

