"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { FormField, FormInput, FormTextarea } from "@/components/ui/form-field"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
})

type ModuleFormData = z.infer<typeof moduleSchema>

export default function NewModulePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
  })

  const onSubmit = async (data: ModuleFormData) => {
    setSubmitting(true)
    try {
      await addDoc(collection(db, "modules"), {
        ...data,
        createdAt: Timestamp.now(),
      })
      router.push("/modules")
    } catch (error) {
      console.error("Error creating module:", error)
      alert("An error occurred while creating the module")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex-col items-center gap-4">
        <Link href="/modules">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Modules
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Module</h1>
          <p className="text-muted-foreground mt-1">
            Fill in the module information below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <FormTextarea
            id="description"
            {...register("description")}
            placeholder="Brief module description"
            error={errors.description?.message}
            rows={4}
            className="resize-none"
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
                acceptMarkdown={true}
                minHeight="400px"
                maxHeight="600px"
              />
            )}
          />
        </FormField>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Link href="/modules">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Module"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

