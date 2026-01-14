"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { doc, getDoc, updateDoc, getDocs, collection, Timestamp } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Event, EventCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FormField, FormInput } from "@/components/ui/form-field"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
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

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  })

  const startDate = watch("startDate")
  const endDate = watch("endDate")

  useEffect(() => {
    fetchCategories()
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  // Auto-correct: if start date exceeds end date, set end date to start date
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setValue("endDate", startDate, { shouldValidate: true })
    }
  }, [startDate, endDate, setValue])

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

  const fetchEvent = async () => {
    try {
      const eventRef = doc(db, "events", eventId)
      const eventSnap = await getDoc(eventRef)
      if (eventSnap.exists()) {
        const data = eventSnap.data()
        const eventData = {
          id: eventSnap.id,
          ...data,
          startDate: data.startDate?.toDate() || data.showAt?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || data.hideAt?.toDate() || new Date(),
        } as Event
        setEvent(eventData)

        let startDateValue: Date
        if (eventData.startDate instanceof Date) {
          startDateValue = eventData.startDate
        } else if ((eventData.startDate as any)?.toDate) {
          startDateValue = (eventData.startDate as any).toDate()
        } else {
          startDateValue = new Date(eventData.startDate as any)
        }

        let endDateValue: Date
        if (eventData.endDate instanceof Date) {
          endDateValue = eventData.endDate
        } else if ((eventData.endDate as any)?.toDate) {
          endDateValue = (eventData.endDate as any).toDate()
        } else {
          endDateValue = new Date(eventData.endDate as any)
        }

        reset({
          title: eventData.title,
          description: eventData.description,
          categoryId: eventData.categoryId,
          startDate: startDateValue,
          endDate: endDateValue,
          registrationLink: eventData.registrationLink,
        })
      } else {
        router.push("/events")
      }
    } catch (error) {
      console.error("Error fetching event:", error)
      router.push("/events")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: EventFormData) => {
    setSubmitting(true)
    try {
      const eventRef = doc(db, "events", eventId)
      await updateDoc(eventRef, {
        ...data,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
      })
      router.push("/events")
    } catch (error) {
      console.error("Error updating event:", error)
      alert("An error occurred while updating the event")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex-col items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex-col items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground mt-1">
            Update the event information below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                acceptMarkdown={true}
                minHeight="300px"
                maxHeight="500px"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href="/events">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

