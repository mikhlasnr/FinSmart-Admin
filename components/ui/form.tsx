import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"

interface FormContextValue {
  errors: Record<string, string | undefined>
}

const FormContext = React.createContext<FormContextValue | undefined>(undefined)

const Form = ({
  children,
  errors = {},
}: {
  children: React.ReactNode
  errors?: Record<string, string | undefined>
}) => {
  return (
    <FormContext.Provider value={{ errors }}>{children}</FormContext.Provider>
  )
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { name?: string }
>(({ className, name, ...props }, ref) => {
  const context = React.useContext(FormContext)
  if (!context) throw new Error("FormItem must be used within Form")

  const error = name ? context.errors[name] : undefined

  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
      data-error={error ? "true" : undefined}
    />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return <Label ref={ref} className={className} {...props} />
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={className} {...props} />
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-[hsl(var(--muted-foreground))]", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { name?: string }
>(({ className, name, ...props }, ref) => {
  const context = React.useContext(FormContext)
  if (!context) throw new Error("FormMessage must be used within Form")

  const error = name ? context.errors[name] : undefined

  if (!error) return null

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}

