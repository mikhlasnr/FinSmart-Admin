"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, getDocs, deleteDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/firebase/config"
import { User } from "@/lib/types"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Users, UserCheck, UserPlus } from "lucide-react"
import { format } from "date-fns"


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData: User[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        usersData.push({
          id: doc.id,
          ...data,
          joinDate: data.joinDate?.toDate() || new Date(),
          lastActive: data.lastActive?.toDate(),
        } as User)
      })
      // Sort by joinDate descending
      usersData.sort((a, b) => {
        const dateA = a.joinDate instanceof Date ? a.joinDate.getTime() : (a.joinDate as any)?.toDate?.()?.getTime() || 0
        const dateB = b.joinDate instanceof Date ? b.joinDate.getTime() : (b.joinDate as any)?.toDate?.()?.getTime() || 0
        return dateB - dateA
      })
      setUsers(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const totalUsers = users.length
    const activeToday = users.filter((user) => {
      if (!user.lastActive) return false
      const lastActive = user.lastActive instanceof Date
        ? user.lastActive
        : (user.lastActive as any)?.toDate?.() || new Date()
      return lastActive >= today
    }).length
    const newThisMonth = users.filter((user) => {
      const joinDate = user.joinDate instanceof Date
        ? user.joinDate
        : (user.joinDate as any)?.toDate?.() || new Date()
      return joinDate >= thisMonth
    }).length

    return { totalUsers, activeToday, newThisMonth }
  }, [users])

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteDoc(doc(db, "users", selectedUser.id))
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Terjadi kesalahan saat menghapus user")
    }
  }


  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`

        return (
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <div className="font-medium">{user.name}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <div className="text-[hsl(var(--muted-foreground))]">{row.original.email}</div>
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <Badge variant={role === "admin" ? "default" : "secondary"}>
            {role === "admin" ? "Admin" : "User"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "joinDate",
      header: "Join Date",
      cell: ({ row }) => {
        const joinDate = row.original.joinDate instanceof Date
          ? row.original.joinDate
          : (row.original.joinDate as any)?.toDate?.() || new Date()
        return format(joinDate, "dd MMM yyyy")
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen User</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Kelola pengguna platform FinSmart
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalUsers}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Total pengguna terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <UserCheck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.activeToday}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Pengguna aktif hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.newThisMonth}</div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Pengguna baru bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Daftar User</CardTitle>
        </CardHeader>
        <CardContent className="overflow-visible">
          <DataTable
            columns={columns}
            data={users}
            searchKey="name"
            searchPlaceholder="Cari berdasarkan nama..."
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user "{selectedUser?.name}"?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))]/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

