import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { studentSchema } from "@/lib/validation"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get("query") || "").trim()
    const location = (searchParams.get("location") || "").trim()

    const db = getDb()
    const conditions: string[] = []
    const params: any[] = []

    if (query) {
      conditions.push("(first_name LIKE ? OR middle_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)")
      const like = `%${query}%`
      params.push(like, like, like, like, like)
    }
    if (location) {
      conditions.push("current_location LIKE ?")
      params.push(`%${location}%`)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const [rows] = await db.query(
      `
      SELECT id, first_name, middle_name, last_name, age, DATE_FORMAT(date_of_birth, '%Y-%m-%d') as date_of_birth,
             current_location, phone, email, created_at, updated_at
      FROM students
      ${where}
      ORDER BY updated_at DESC
      LIMIT 500
    `,
      params,
    )

    return NextResponse.json({ data: rows })
  } catch (err: any) {
    console.error("[v0] GET /api/students error:", err?.message)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = studentSchema.parse(json)

    const db = getDb()
    const [result] = await db.execute(
      `
      INSERT INTO students
        (first_name, middle_name, last_name, age, date_of_birth, current_location, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
      ],
    )

    // @ts-ignore - mysql2 returns insertId
    const id = result.insertId as number

    return NextResponse.json({ id }, { status: 201 })
  } catch (err: any) {
    const message = err?.issues?.[0]?.message || err?.message || "Invalid input"
    const status = err?.issues ? 400 : 500
    console.error("[v0] POST /api/students error:", err)
    return NextResponse.json({ error: message }, { status })
  }
}
