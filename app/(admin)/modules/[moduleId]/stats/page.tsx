"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore"
import { db } from "@/firebase/config"
import { ExamResult, Module } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, TrendingUp, TrendingDown, Award, Users } from "lucide-react"
import { format } from "date-fns"

export default function StatsPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.moduleId as string

  const [module, setModule] = useState<Module | null>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    fetchModule()
    fetchResults()
  }, [moduleId])

  const fetchModule = async () => {
    try {
      const moduleDoc = await getDoc(doc(db, "modules", moduleId))
      if (moduleDoc.exists()) {
        const moduleData = {
          id: moduleDoc.id,
          ...moduleDoc.data(),
          createdAt: moduleDoc.data().createdAt?.toDate() || new Date(),
        } as Module
        setModule(moduleData)
      }
    } catch (error) {
      console.error("Error fetching module:", error)
    }
  }

  const fetchResults = async () => {
    try {
      const q = query(collection(db, "exam_results"), where("moduleId", "==", moduleId))
      const querySnapshot = await getDocs(q)
      const resultsData: ExamResult[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        resultsData.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          answers: data.answers || [],
        } as ExamResult)
      })
      // Sort by submittedAt descending
      resultsData.sort((a, b) => {
        const dateA = a.submittedAt instanceof Date ? a.submittedAt.getTime() : (a.submittedAt as any)?.toDate?.()?.getTime() || 0
        const dateB = b.submittedAt instanceof Date ? b.submittedAt.getTime() : (b.submittedAt as any)?.toDate?.()?.getTime() || 0
        return dateB - dateA
      })
      setResults(resultsData)
    } catch (error) {
      console.error("Error fetching results:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (results.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        totalParticipants: 0,
      }
    }

    const scores = results.map((r) => r.totalScore)
    const sum = scores.reduce((acc, score) => acc + score, 0)
    const average = sum / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)

    return {
      average: Math.round(average * 10) / 10,
      highest,
      lowest,
      totalParticipants: results.length,
    }
  }, [results])

  const handleRowClick = (result: ExamResult) => {
    setSelectedResult(result)
    setSheetOpen(true)
  }

  const getScoreColor = (finalScore: number, maxScore: number) => {
    const percentage = (finalScore / maxScore) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (finalScore: number, maxScore: number) => {
    const percentage = (finalScore / maxScore) * 100
    if (percentage >= 80) return "bg-green-50 border-green-200"
    if (percentage >= 60) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
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
            Exam Statistics - {module?.title || "Loading..."}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Exam results report for this module
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              From {stats.totalParticipants} participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Award className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.highest}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Best score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Score</CardTitle>
            <TrendingDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowest}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Lowest score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Students who have completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Result Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Results List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submit Date</TableHead>
                  <TableHead className="text-right">Final Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-[hsl(var(--muted-foreground))]"
                    >
                      No exam results yet. Data will appear after students complete the exam.
                    </TableCell>
                  </TableRow>
                ) : (
                  results.map((result) => (
                    <TableRow
                      key={result.id}
                      className="cursor-pointer hover:bg-[hsl(var(--accent))]"
                      onClick={() => handleRowClick(result)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={result.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.userDisplayName)}&background=random`}
                            alt={result.userDisplayName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <div className="font-medium">{result.userDisplayName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[hsl(var(--muted-foreground))]">
                        {result.userEmail}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          let date: Date
                          if (result.submittedAt instanceof Date) {
                            date = result.submittedAt
                          } else if ((result.submittedAt as any)?.toDate) {
                            date = (result.submittedAt as any).toDate()
                          } else {
                            date = new Date(result.submittedAt as any)
                          }
                          return format(date, "dd MMM yyyy HH:mm")
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="default" className="font-semibold">
                          {result.totalScore}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto w-full sm:w-[600px]">
          <SheetClose />
          {selectedResult && (
            <>
              <SheetHeader>
                <SheetTitle>Answer Details</SheetTitle>
                <SheetDescription>
                  {selectedResult.userDisplayName} - {selectedResult.userEmail}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Total Score</p>
                    <p className="text-2xl font-bold">{selectedResult.totalScore}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Submit Date</p>
                    <p className="text-sm font-medium">
                      {(() => {
                        let date: Date
                        if (selectedResult.submittedAt instanceof Date) {
                          date = selectedResult.submittedAt
                        } else if ((selectedResult.submittedAt as any)?.toDate) {
                          date = (selectedResult.submittedAt as any).toDate()
                        } else {
                          date = new Date(selectedResult.submittedAt as any)
                        }
                        return format(date, "dd MMM yyyy HH:mm")
                      })()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedResult.answers.map((answer, index) => {
                    const percentage = (answer.finalScore / answer.maxScore) * 100
                    return (
                      <div
                        key={answer.questionId}
                        className={`p-4 rounded-lg border ${getScoreBgColor(answer.finalScore, answer.maxScore)}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                                Question {index + 1}
                              </span>
                              <Badge variant="outline" className={getScoreColor(answer.finalScore, answer.maxScore)}>
                                {answer.finalScore} / {answer.maxScore}
                              </Badge>
                            </div>
                            <p className="font-medium mb-2">{answer.question}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-1">
                              Student Answer:
                            </p>
                            <div className="p-3 bg-white rounded border">
                              <p className="text-sm whitespace-pre-wrap">{answer.userAnswer}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[hsl(var(--muted-foreground))] mb-1">
                              Key Answer:
                            </p>
                            <div className="p-3 bg-white rounded border">
                              <p className="text-sm whitespace-pre-wrap">{answer.keyAnswer}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Similarity Score</p>
                              <p className="text-sm font-medium">
                                {(answer.similarityScore * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">Final Score</p>
                              <p className={`text-sm font-bold ${getScoreColor(answer.finalScore, answer.maxScore)}`}>
                                {answer.finalScore} / {answer.maxScore} ({percentage.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

