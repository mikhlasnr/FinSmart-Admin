"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

export default function EventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

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
    router.push("/events/new")
  }

  const handleEdit = (event: Event) => {
    router.push(`/events/${event.id}/edit`)
  }

  const handleDelete = (event: Event) => {
    setSelectedEvent(event)
    setDeleteDialogOpen(true)
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

