import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/booktracker'
const connection = postgres(connectionString)
const db = drizzle(connection)

async function reset() {
  console.log('🗑️  Resetting database...')

  await db.execute(sql`DROP TABLE IF EXISTS reviews CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS reading_goals CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS book_categories CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS books CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS categories CASCADE`)
  await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`)

  console.log('✅ All tables dropped')
  console.log('💡 Run "pnpm db:push" to recreate tables')
  console.log('💡 Then run "pnpm db:seed" to seed data')

  await connection.end()
}

reset().catch((error) => {
  console.error('❌ Reset failed:', error)
  process.exit(1)
})
