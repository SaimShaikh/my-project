"use client"

import { useState } from "react"
import { z } from "zod"
import { studentSchema, type StudentInput, type Student } from "@/lib/validation"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

type Props = {
  initial?: Partial<Student>
  onDone?: () => void
  mode: "create" | "edit"
}

async function postJSON(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || "Failed")
  }
  return res.json()
}

async function patchJSON(url: string, { arg }: { arg: any }) {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error || "Failed")
  }
  return res.json()
}

export function StudentForm({ initial, onDone, mode }: Props) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState<StudentInput>({
    first_name: initial?.first_name ?? "",
    middle_name: initial?.middle_name ?? "",
    last_name: initial?.last_name ?? "",
    age: (initial?.age as any) ?? ("" as unknown as number),
    date_of_birth: initial?.date_of_birth ?? "",
    current_location: initial?.current_location ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
  })

  const { trigger: create, isMutating: creating } = useSWRMutation("/api/students", postJSON)
  const { trigger: update, isMutating: updating } = useSWRMutation(
    initial?.id ? `/api/students/${initial.id}` : null,
    patchJSON,
  )

  function handleChange<K extends keyof StudentInput>(key: K, value: StudentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit() {
    setErrors({})
    try {
      const parsed = studentSchema.parse(form)
      if (mode === "create") {
        await create(parsed)
        toast({ title: "Student added", description: "The student was created successfully." })
      } else if (mode === "edit" && initial?.id) {
        await update(parsed)
        toast({ title: "Student updated", description: "The student was updated successfully." })
      }
      setOpen(false)
      onDone?.()
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of err.issues) {
          const path = issue.path?.[0] as string
          if (path) fieldErrors[path] = issue.message
        }
        setErrors(fieldErrors)
      } else {
        toast({ title: "Error", description: err?.message || "Something went wrong." })
      }
    }
  }

  const busy = creating || updating

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="transition-transform duration-200 hover:scale-[1.02]">Add Student</Button>
        ) : (
          <Button variant="secondary" className="transition-transform duration-200 hover:scale-[1.02]">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-balance">{mode === "create" ? "Add Student" : "Edit Student"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              aria-invalid={!!errors.first_name}
            />
            {errors.first_name && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.first_name}</p>}
          </div>
          <div>
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              value={form.middle_name ?? ""}
              onChange={(e) => handleChange("middle_name", e.target.value)}
              aria-invalid={!!errors.middle_name}
            />
            {errors.middle_name && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.middle_name}</p>}
          </div>
          <div>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={form.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              aria-invalid={!!errors.last_name}
            />
            {errors.last_name && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.last_name}</p>}
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              value={form.age as any}
              onChange={(e) => handleChange("age", e.target.value as any)}
              aria-invalid={!!errors.age}
            />
            {errors.age && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.age}</p>}
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              aria-invalid={!!errors.date_of_birth}
            />
            {errors.date_of_birth && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.date_of_birth}</p>
            )}
          </div>
          <div>
            <Label htmlFor="location">Current Location</Label>
            <Input
              id="location"
              value={form.current_location ?? ""}
              onChange={(e) => handleChange("current_location", e.target.value)}
              aria-invalid={!!errors.current_location}
            />
            {errors.current_location && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.current_location}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone ?? ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-invalid={!!errors.email}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={() => setOpen(false)} className="transition-colors">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={busy}
            className="transition-transform duration-200 hover:scale-[1.02]"
          >
            {busy ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
