"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { studentSchema, type StudentInput, type Student } from "@/lib/validation"
import useSWRMutation from "swr/mutation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// ---------- helpers ----------
function calcAgeFromDOB(dobISO: string | undefined) {
  if (!dobISO) return "" as unknown as number
  const d = new Date(dobISO)
  if (Number.isNaN(+d)) return "" as unknown as number
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age as unknown as number
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

// ---------- component ----------

type Props = {
  initial?: Partial<Student>
  onDone?: () => void
  mode: "create" | "edit"
}

export function StudentForm({ initial, onDone, mode }: Props) {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

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

  const busy = creating || updating

  function handleChange<K extends keyof StudentInput>(key: K, value: StudentInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // auto-calc age from DOB if empty
  useEffect(() => {
    if (!form.date_of_birth) return
    const computed = calcAgeFromDOB(form.date_of_birth)
    if (!form.age && computed) {
      setForm((f) => ({ ...f, age: computed }))
    }
  }, [form.date_of_birth])

  async function handleSubmit() {
    setErrors({})
    setApiError(null)
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
        const msg = err?.message || "Something went wrong."
        setApiError(msg)
        toast({ title: "Error", description: msg })
      }
    }
  }

  // phone mask (lightweight, non-intrusive)
  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 15)
    if (d.startsWith("91") && d.length > 2) return "+" + d
    if (v.startsWith("+")) return "+" + d
    return d
  }

  // dialog title/cta text
  const title = mode === "create" ? "Add Student" : "Edit Student"
  const cta = busy ? "Saving..." : mode === "create" ? "Create" : "Save changes"

  // pre-format date to Date object for Calendar
  const dobDate = useMemo(() => (form.date_of_birth ? new Date(form.date_of_birth) : undefined), [form.date_of_birth])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="transition-transform duration-200 hover:scale-[1.02]">Add Student</Button>
        ) : (
          <Button variant="secondary" className="transition-transform duration-200 hover:scale-[1.02]">Edit</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-balance">{title}</DialogTitle>
          <DialogDescription>Fill out the student details below. Fields with errors will be highlighted.</DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              value={form.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              aria-invalid={!!errors.first_name}
              autoFocus
              placeholder="e.g. Rahul"
            />
            {errors.first_name && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.first_name}</p>}
          </div>

          <div>
            <Label htmlFor="middle_name">Middle Name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="middle_name"
              value={form.middle_name ?? ""}
              onChange={(e) => handleChange("middle_name", e.target.value)}
              aria-invalid={!!errors.middle_name}
              placeholder="—"
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
              placeholder="e.g. Sharma"
            />
            {errors.last_name && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.last_name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="age">Age</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-xs text-muted-foreground underline underline-offset-4">Auto from DOB</TooltipTrigger>
                  <TooltipContent>We prefill this when you pick a date of birth. You can still edit it.</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              value={form.age as any}
              onChange={(e) => handleChange("age", e.target.value as any)}
              aria-invalid={!!errors.age}
              placeholder="e.g. 21"
            />
            {errors.age && <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.age}</p>}
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dob"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dobDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dobDate ? format(dobDate, "yyyy-MM-dd") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dobDate}
                  onSelect={(d) => handleChange("date_of_birth", d ? format(d, "yyyy-MM-dd") : "")}
                  captionLayout="dropdown-buttons"
                  fromYear={1960}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
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
              placeholder="City, Country"
            />
            {errors.current_location && (
              <p className="text-[var(--color-destructive)] text-sm mt-1">{errors.current_location}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone <span className="text-muted-foreground">(with country code)</span></Label>
            <Input
              id="phone"
              value={form.phone ?? ""}
              onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
              aria-invalid={!!errors.phone}
              placeholder="+91 9876543210"
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

        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-muted-foreground">All changes are saved to the server when you hit save.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)} className="transition-colors" disabled={busy}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={busy} className="transition-transform duration-200 hover:scale-[1.02]">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {cta}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
