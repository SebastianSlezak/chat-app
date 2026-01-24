import { eq, and, sql } from 'drizzle-orm'
import { db } from '../db'
import { books } from '../db/schema'
import type { UserStats } from '~/types'

export async function getUserStats(userId: number): Promise<UserStats> {
  const allBooks = await db.query.books.findMany({
    where: eq(books.userId, userId)
  })

  const totalBooks = allBooks.length
  const booksReading = allBooks.filter(b => b.status === 'reading').length
  const booksCompleted = allBooks.filter(b => b.status === 'completed').length
  
  const totalPages = allBooks.reduce((sum, book) => sum + book.totalPages, 0)
  const pagesRead = allBooks.reduce((sum, book) => sum + book.currentPage, 0)
  
  const ratedBooks = allBooks.filter(b => b.rating !== null)
  const averageRating = ratedBooks.length > 0
    ? ratedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / ratedBooks.length
    : 0

  return {
    totalBooks,
    booksReading,
    booksCompleted,
    totalPages,
    pagesRead,
    averageRating: Math.round(averageRating * 10) / 10
  }
}

export async function getMonthlyStats(userId: number, year: number) {
  const allBooks = await db.query.books.findMany({
    where: eq(books.userId, userId)
  })

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    booksCompleted: 0,
    pagesRead: 0
  }))

  allBooks.forEach(book => {
    if (book.finishDate) {
      const finishYear = book.finishDate.getFullYear()
      if (finishYear === year) {
        const month = book.finishDate.getMonth()
        monthlyData[month].booksCompleted++
        monthlyData[month].pagesRead += book.totalPages
      }
    }
  })

  return monthlyData
}

export async function getCategoryStats(userId: number) {
  const result = await db.execute(sql`
    SELECT 
      c.name,
      COUNT(DISTINCT b.id) as book_count,
      COALESCE(AVG(b.rating), 0) as avg_rating
    FROM categories c
    LEFT JOIN book_categories bc ON c.id = bc.category_id
    LEFT JOIN books b ON bc.book_id = b.id AND b.user_id = ${userId}
    WHERE b.id IS NOT NULL
    GROUP BY c.id, c.name
    ORDER BY book_count DESC
    LIMIT 10
  `)

  return result.rows as { name: string; book_count: string; avg_rating: string }[]
}