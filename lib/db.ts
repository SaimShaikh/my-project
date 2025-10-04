import mysql, { type Pool } from "mysql2/promise"

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined
}

function required(name: string, value: string | undefined) {
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export function getDb() {
  if (!global.__mysqlPool) {
    const host = required("DB_HOST", process.env.DB_HOST)
    const user = required("DB_USER", process.env.DB_USER)
    const password = required("DB_PASSWORD", process.env.DB_PASSWORD)
    const port = Number(required("DB_PORT", process.env.DB_PORT))
    const database = required("DB_NAME", process.env.DB_NAME)

    global.__mysqlPool = mysql.createPool({
      host,
      user,
      password,
      port,
      database,
      connectionLimit: 10,
      enableKeepAlive: true,
      waitForConnections: true,
      // If your RDS requires TLS, uncomment below:
      // ssl: { rejectUnauthorized: true },
    })
  }
  return global.__mysqlPool
}
