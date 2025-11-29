"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import { Event, EventCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormField, FormInput, FormTextarea } from "@/components/ui/form-field"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"

const eventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    categoryId: z.string().min(1, "Category must be selected"),
    startDate: z.date({ message: "Start date must be selected" }),
    endDate: z.date({ message: "End date must be selected" }),
    registrationLink: z.string().url("Invalid URL").min(1, "Registration link is required"),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
})

type EventFormData = z.infer<typeof eventSchema>

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  const startDate = watch("startDate")
  const endDate = watch("endDate")

  // Auto-correct: if start date exceeds end date, set end date to start date
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setValue("endDate", startDate, { shouldValidate: true })
    }
  }, [startDate, endDate, setValue])

  useEffect(() => {
    fetchCategories()
    fetchEvents()
  }, [])

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "eventCategories"))
      const categoriesData: EventCategory[] = []
      querySnapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          ...doc.data(),
        } as EventCategory)
      })
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"))
      const eventsData: Event[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        eventsData.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || data.showAt?.toDate() || new Date(), // Support both old and new field names
          endDate: data.endDate?.toDate() || data.hideAt?.toDate() || new Date(), // Support both old and new field names
        } as Event)
      })
      // Sort by startDate descending
      eventsData.sort((a, b) => {
        const dateA = a.startDate instanceof Date ? a.startDate.getTime() : (a.startDate as any)?.toDate?.()?.getTime() || 0
        const dateB = b.startDate instanceof Date ? b.startDate.getTime() : (b.startDate as any)?.toDate?.()?.getTime() || 0
        return dateB - dateA
      })
      setEvents(eventsData)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedEvent(null)
    reset()
    setDialogOpen(true)
  }

  const handleEdit = (event: Event) => {
    setSelectedEvent(event)
    let startDateValue: Date
    if (event.startDate instanceof Date) {
      startDateValue = event.startDate
    } else if ((event.startDate as any)?.toDate) {
      startDateValue = (event.startDate as any).toDate()
    } else {
      startDateValue = new Date(event.startDate as any)
    }

    let endDateValue: Date
    if (event.endDate instanceof Date) {
      endDateValue = event.endDate
    } else if ((event.endDate as any)?.toDate) {
      endDateValue = (event.endDate as any).toDate()
    } else {
      endDateValue = new Date(event.endDate as any)
    }

    reset({
      title: event.title,
      description: event.description,
      categoryId: event.categoryId,
      startDate: startDateValue,
      endDate: endDateValue,
      registrationLink: event.registrationLink,
    })
    setDialogOpen(true)
  }

  const handleDelete = (event: Event) => {
    setSelectedEvent(event)
    setDeleteDialogOpen(true)
  }

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true)
    try {
      if (selectedEvent) {
        // Update existing event
        const eventRef = doc(db, "events", selectedEvent.id)
        await updateDoc(eventRef, {
          ...data,
          startDate: Timestamp.fromDate(data.startDate),
          endDate: Timestamp.fromDate(data.endDate),
        })
      } else {
        // Create new event
        await addDoc(collection(db, "events"), {
          ...data,
          startDate: Timestamp.fromDate(data.startDate),
          endDate: Timestamp.fromDate(data.endDate),
        })
      }
      setDialogOpen(false)
      reset()
      fetchEvents()
    } catch (error) {
      console.error("Error saving event:", error)
      alert("An error occurred while saving the event")
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedEvent) return

    try {
      await deleteDoc(doc(db, "events", selectedEvent.id))
      setDeleteDialogOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("An error occurred while deleting the event")
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "Unknown"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage financial literacy programs and events
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Registration Link</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No events yet. Click "Add Event" to create the first event.
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{getCategoryName(event.categoryId)}</TableCell>
                  <TableCell>
                    {(() => {
                      let date: Date
                      if (event.startDate instanceof Date) {
                        date = event.startDate
                      } else if ((event.startDate as any)?.toDate) {
                        date = (event.startDate as any).toDate()
                      } else {
                        date = new Date(event.startDate as any)
                      }
                      return format(date, "dd MMM yyyy")
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      let date: Date
                      if (event.endDate instanceof Date) {
                        date = event.endDate
                      } else if ((event.endDate as any)?.toDate) {
                        date = (event.endDate as any).toDate()
                      } else {
                        date = new Date(event.endDate as any)
                      }
                      return format(date, "dd MMM yyyy")
                    })()}
                  </TableCell>
                  <TableCell>
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Open Link
                    </a>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? "Update the event information below"
                : "Fill in the new event information below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Event Title"
              error={errors.title?.message}
            >
              <FormInput
                id="title"
                {...register("title")}
                placeholder="Example: Investment Workshop for Beginners"
                error={errors.title?.message}
              />
            </FormField>
            <FormField
              label="Description"
              error={errors.description?.message}
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Event description..."
                    error={errors.description?.message}
                  />
              )}
              />
            </FormField>
            <FormField
              label="Category"
              error={errors.categoryId?.message}
            >
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => {
                  const selectedCategory = categories.find((cat) => cat.id === field.value)
                  return (
                  <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={errors.categoryId ? "border-red-500 focus:ring-red-500" : ""}
                      >
                        <SelectValue placeholder="Select category">
                          {selectedCategory ? selectedCategory.name : ""}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  )
                }}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={errors.startDate ? "text-red-600" : ""}>
                  Start Date
                </Label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    readOnly
                    value={watch("startDate") ? format(watch("startDate"), "dd MMM yyyy") : ""}
                    placeholder="Select start date"
                    className={`bg-[hsl(var(--muted))] cursor-not-allowed ${errors.startDate ? "border-red-500" : ""
                      }`}
                  />
                <Controller
                    name="startDate"
                  control={control}
                  render={({ field }) => (
                        <Calendar
                          selected={field.value}
                          onSelect={(date) => {
                          if (date) {
                            field.onChange(date)
                          }
                          }}
                        />
                  )}
                />
                </div>
                {errors.startDate && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className={errors.endDate ? "text-red-600" : ""}>
                  End Date
                </Label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    readOnly
                    value={watch("endDate") ? format(watch("endDate"), "dd MMM yyyy") : ""}
                    placeholder="Select end date"
                    className={`bg-[hsl(var(--muted))] cursor-not-allowed ${errors.endDate ? "border-red-500" : ""
                      }`}
                  />
                <Controller
                    name="endDate"
                  control={control}
                    render={({ field }) => {
                      const startDateValue = watch("startDate")
                      // Min date is start date (end date must be >= start date)
                      const minEndDate = startDateValue ? startDateValue : undefined
                      return (
                        <Calendar
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                            field.onChange(date)
                            }
                          }}
                          minDate={minEndDate}
                        />
                      )
                          }}
                        />
                </div>
                {errors.endDate && (
                  <p className="text-sm font-medium text-red-600">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>
            <FormField
              label="Registration Link"
              error={errors.registrationLink?.message}
            >
              <FormInput
                id="registrationLink"
                type="url"
                {...register("registrationLink")}
                placeholder="https://example.com/register"
                error={errors.registrationLink?.message}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the event "{selectedEvent?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

