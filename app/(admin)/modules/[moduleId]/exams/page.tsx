"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import { Exam, Module } from "@/lib/types"
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
import { Plus, Edit, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const examSchema = z.object({
  question: z.string().min(1, "Question is required"),
  keyAnswer: z.string().min(1, "Key answer is required"),
  maxScore: z.number().min(1, "Maximum score must be greater than 0"),
})

type ExamFormData = z.infer<typeof examSchema>

export default function ExamsPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const [module, setModule] = useState<Module | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
  })

  useEffect(() => {
    fetchModule()
    fetchExams()
  }, [moduleId])

  const fetchModule = async () => {
    try {
      const moduleDoc = await getDoc(doc(db, "modules", moduleId))
      if (moduleDoc.exists()) {
        const moduleData = {
          id: moduleDoc.id,
          ...moduleDoc.data(),
        } as Module
        setModule(moduleData)
      }
    } catch (error) {
      console.error("Error fetching module:", error)
    }
  }

  const fetchExams = async () => {
    try {
      const q = query(collection(db, "exams"), where("moduleId", "==", moduleId))
      const querySnapshot = await getDocs(q)
      const examsData: Exam[] = []
      querySnapshot.forEach((doc) => {
        examsData.push({
          id: doc.id,
          ...doc.data(),
        } as Exam)
      })
      setExams(examsData)
    } catch (error) {
      console.error("Error fetching exams:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedExam(null)
    reset()
    setDialogOpen(true)
  }

  const handleEdit = (exam: Exam) => {
    setSelectedExam(exam)
    reset({
      question: exam.question,
      keyAnswer: exam.keyAnswer,
      maxScore: exam.maxScore,
    })
    setDialogOpen(true)
  }

  const handleDelete = (exam: Exam) => {
    setSelectedExam(exam)
    setDeleteDialogOpen(true)
  }

  const onSubmit = async (data: ExamFormData) => {
    setSubmitting(true)
    try {
      if (selectedExam) {
        // Update existing exam
        const examRef = doc(db, "exams", selectedExam.id)
        await updateDoc(examRef, data)
      } else {
        // Create new exam
        await addDoc(collection(db, "exams"), {
          ...data,
          moduleId,
        })
      }
      setDialogOpen(false)
      reset()
      fetchExams()
    } catch (error) {
      console.error("Error saving exam:", error)
      alert("An error occurred while saving the exam question")
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedExam) return

    try {
      await deleteDoc(doc(db, "exams", selectedExam.id))
      setDeleteDialogOpen(false)
      setSelectedExam(null)
      fetchExams()
    } catch (error) {
      console.error("Error deleting exam:", error)
      alert("An error occurred while deleting the exam question")
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
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/modules")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Exam Questions - {module?.title || "Loading..."}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage exam questions for this module
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Key Answer</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No exam questions yet. Click "Add Question" to create the first question.
                </TableCell>
              </TableRow>
            ) : (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="max-w-md">{exam.question}</TableCell>
                  <TableCell className="max-w-md">{exam.keyAnswer}</TableCell>
                  <TableCell>{exam.maxScore}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(exam)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(exam)}
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
              {selectedExam ? "Edit Exam Question" : "Add New Exam Question"}
            </DialogTitle>
            <DialogDescription>
              {selectedExam
                ? "Update the exam question information below"
                : "Fill in the new exam question information below"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="Question"
              error={errors.question?.message}
            >
              <FormTextarea
                id="question"
                {...register("question")}
                placeholder="Enter exam question..."
                error={errors.question?.message}
              />
            </FormField>
            <FormField
              label="Key Answer (for AI)"
              error={errors.keyAnswer?.message}
            >
              <FormTextarea
                id="keyAnswer"
                {...register("keyAnswer")}
                placeholder="Enter ideal key answer for AI grading..."
                error={errors.keyAnswer?.message}
              />
            </FormField>
            <FormField
              label="Maximum Score"
              error={errors.maxScore?.message}
            >
              <FormInput
                id="maxScore"
                type="number"
                {...register("maxScore", { valueAsNumber: true })}
                placeholder="100"
                min="1"
                error={errors.maxScore?.message}
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
            <AlertDialogTitle>Delete Exam Question?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam question? This action cannot be undone.
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

