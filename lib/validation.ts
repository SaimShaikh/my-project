import { z } from "zod"

export const studentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  middle_name: z.string().trim().max(100).optional().or(z.literal("")),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  age: z.coerce.number().int().min(0).max(150),
  date_of_birth: z.string().refine((s) => {
    const d = new Date(s)
    return !Number.isNaN(d.getTime()) && d <= new Date()
  }, "Date of birth must be valid and not in the future"),
  current_location: z.string().trim().max(255).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(50)
    .regex(/^[0-9+()\-.\s]*$/, "Phone can only contain numbers and phone symbols")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Invalid email address").max(255),
})

export type StudentInput = z.infer<typeof studentSchema>

export type Student = {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  age: number
  date_of_birth: string // ISO date string
  current_location: string | null
  phone: string | null
  email: string
  created_at: string
  updated_at: string
}
