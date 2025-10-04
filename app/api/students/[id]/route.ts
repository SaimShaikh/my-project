import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { studentSchema } from "@/lib/validation"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }

    const json = await request.json()
    const parsed = studentSchema.parse(json)

    const db = getDb()
    const [result] = await db.execute(
      `
      UPDATE students SET
        first_name = ?, middle_name = ?, last_name = ?, age = ?, date_of_birth = ?,
        current_location = ?, phone = ?, email = ?
      WHERE id = ?
    `,
      [
        parsed.first_name,
        parsed.middle_name || null,
        parsed.last_name,
        parsed.age,
        parsed.date_of_birth,
        parsed.current_location || null,
        parsed.phone || null,
        parsed.email,
        id,
      ],
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const message = err?.issues?.[0]?.message || err?.message || "Invalid input"
    const status = err?.issues ? 400 : 500
    console.error("[v0] PATCH /api/students/[id] error:", err)
    return NextResponse.json({ error: message }, { status })
  }
}
