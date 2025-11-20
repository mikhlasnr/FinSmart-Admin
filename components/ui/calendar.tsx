import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
  minDate?: Date
  maxDate?: Date
}

const Calendar = ({ selected, onSelect, className, minDate, maxDate }: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  )

  const monthStart = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  )
  const monthEnd = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  )
  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days: (Date | null)[] = []
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    days.push(date)
  }

  const isSameMonth = (date: Date) => {
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isSelected = (date: Date) => {
    if (!selected) return false
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const isDisabled = (date: Date) => {
    if (minDate) {
      const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      if (dateOnly < minDateOnly) return true
    }
    if (maxDate) {
      const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      if (dateOnly > maxDateOnly) return true
    }
    return false
  }

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    )
  }

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    )
  }

  return (
    <div className={cn("rounded-md border p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="hover:bg-[hsl(var(--accent))] rounded p-1 cursor-pointer transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="hover:bg-[hsl(var(--accent))] rounded p-1 cursor-pointer transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-[hsl(var(--muted-foreground))] p-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) return <div key={idx} />
          const sameMonth = isSameMonth(date)
          const selectedDay = isSelected(date)
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!isDisabled(date)) {
                  onSelect?.(date)
                }
              }}
              disabled={isDisabled(date)}
              className={cn(
                "h-9 w-9 rounded-md text-sm cursor-pointer transition-colors",
                !sameMonth && "text-[hsl(var(--muted-foreground))] opacity-50",
                isDisabled(date) && "opacity-30 cursor-not-allowed",
                selectedDay
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
                  : "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { Calendar }

