"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Module } from "@/lib/types"
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
import { FormField, FormInput } from "@/components/ui/form-field"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Plus, Edit, Trash2, Loader2, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
})

type ModuleFormData = z.infer<typeof moduleSchema>

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  })

  // Fetch modules
  useEffect(() => {
    fetchModules()
  }, [])

  const fetchModules = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "modules"))
      const modulesData: Module[] = []
      querySnapshot.forEach((doc) => {
        modulesData.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Module)
      })
      // Sort by createdAt descending
      modulesData.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt as any)?.toDate?.()?.getTime() || 0
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt as any)?.toDate?.()?.getTime() || 0
        return dateB - dateA
      })
      setModules(modulesData)
    } catch (error) {
      console.error("Error fetching modules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedModule(null)
    reset()
    setDialogOpen(true)
  }

  const handleEdit = (module: Module) => {
    setSelectedModule(module)
    reset({
      title: module.title,
      description: module.description,
      content: module.content,
    })
    setDialogOpen(true)
  }

  const handleDelete = (module: Module) => {
    setSelectedModule(module)
    setDeleteDialogOpen(true)
  }

  const onSubmit = async (data: ModuleFormData) => {
    setSubmitting(true)
    try {
      if (selectedModule) {
        // Update existing module
        const moduleRef = doc(db, "modules", selectedModule.id)
        await updateDoc(moduleRef, {
          ...data,
          updatedAt: Timestamp.now(),
        })
      } else {
        // Create new module
        await addDoc(collection(db, "modules"), {
          ...data,
          createdAt: Timestamp.now(),
        })
      }
      setDialogOpen(false)
      reset()
      fetchModules()
    } catch (error) {
      console.error("Error saving module:", error)
      alert("An error occurred while saving the module")
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedModule) return

    try {
      await deleteDoc(doc(db, "modules", selectedModule.id))
      setDeleteDialogOpen(false)
      setSelectedModule(null)
      fetchModules()
    } catch (error) {
      console.error("Error deleting module:", error)
      alert("An error occurred while deleting the module")
    }
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
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage financial literacy learning modules
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No modules yet. Click "Add Module" to create the first module.
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.title}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {module.description}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      let date: Date
                      if (module.createdAt instanceof Date) {
                        date = module.createdAt
                      } else if ((module.createdAt as any)?.toDate) {
                        date = (module.createdAt as any).toDate()
                      } else {
                        date = new Date(module.createdAt as any)
                      }
                      return date.toLocaleDateString("en-US")
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/modules/${module.id}/exams`)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Exams
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(module)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(module)}
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
              {selectedModule ? "Edit Module" : "Add New Module"}
            </DialogTitle>
            <DialogDescription>
              {selectedModule
                ? "Update the module information below"
                : "Fill in the new module information below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Module Title"
              error={errors.title?.message}
            >
              <FormInput
                id="title"
                {...register("title")}
                placeholder="Example: Introduction to Investment"
                error={errors.title?.message}
              />
            </FormField>
            <FormField
              label="Description"
              error={errors.description?.message}
            >
              <FormInput
                id="description"
                {...register("description")}
                placeholder="Brief module description"
                error={errors.description?.message}
              />
            </FormField>
            <FormField
              label="Content"
              error={errors.content?.message}
            >
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    content={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Enter module content..."
                    error={errors.content?.message}
                  />
                )}
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
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the module "{selectedModule?.title}"?
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

