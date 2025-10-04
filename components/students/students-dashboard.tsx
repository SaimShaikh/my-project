"use client"

import useSWR, { mutate } from "swr"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Student } from "@/lib/validation"
import { StudentForm } from "./student-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function StudentsDashboard() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const url = useMemo(() => {
    const p = new URLSearchParams()
    if (query.trim()) p.set("query", query.trim())
    if (location.trim()) p.set("location", location.trim())
    return `/api/students?${p.toString()}`
  }, [query, location])

  const { data, isLoading } = useSWR<{ data: Student[] }>(url, fetcher)
  const students = data?.data ?? []

  function refresh() {
    mutate(url)
  }

  async function handleConfirmDelete(id: number) {
    try {
      setDeletingId(id)
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Failed to delete")
      }
      toast({ title: "Student deleted", description: `Record #${id} was removed.` })
      refresh()
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.message || "Could not delete the student." })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="p-4 md:p-8">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-balance">Student Records</h1>
          <p className="text-sm text-muted-foreground">Search, filter, add, and edit student data.</p>
        </div>
        <StudentForm mode="create" onDone={refresh} />
      </header>

      <Card className="border border-[var(--color-border)] animate-in fade-in slide-in-from-bottom-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name, email, phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("")
                setLocation("")
              }}
              className="transition-transform duration-200 hover:scale-[1.02]"
            >
              Reset
            </Button>
          </div>
          <Input placeholder="Filter by location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Results {isLoading ? "(Loading...)" : `(${students.length})`}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-[var(--color-secondary)]">
                  <th className="p-3">Name</th>
                  <th className="p-3">Age</th>
                  <th className="p-3">DOB</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-accent)]"
                  >
                    <td className="p-3">
                      <div className="font-medium">{`${s.first_name} ${s.middle_name ? s.middle_name + " " : ""}${s.last_name}`}</div>
                      <div className="text-muted-foreground">{s.id}</div>
                    </td>
                    <td className="p-3">{s.age}</td>
                    <td className="p-3">{s.date_of_birth}</td>
                    <td className="p-3">{s.current_location ?? "-"}</td>
                    <td className="p-3">{s.phone ?? "-"}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <StudentForm mode="edit" initial={s} onDone={refresh} />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              disabled={deletingId === s.id}
                              className="transition-transform duration-200 hover:scale-[1.02]"
                              aria-label={`Delete ${s.first_name} ${s.last_name}`}
                            >
                              {deletingId === s.id ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-balance">Delete this student?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the student record (ID {s.id}). This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-end gap-2 pt-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleConfirmDelete(s.id)}
                                className="bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90"
                              >
                                Confirm delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground">
                      No results found. Try adjusting your search or add a new student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
