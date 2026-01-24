import type { users, books, categories, reviews, readingGoals } from '~/server/db/schema'

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert

export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert

export type ReadingGoal = typeof readingGoals.$inferSelect
export type NewReadingGoal = typeof readingGoals.$inferInsert

export type ReadingStatus = 'to_read' | 'reading' | 'completed' | 'abandoned'
export type UserRole = 'user' | 'admin'

export interface BookWithCategories extends Book {
  categories: Category[]
  review?: Review | null
}

export interface UserStats {
  totalBooks: number
  booksReading: number
  booksCompleted: number
  totalPages: number
  pagesRead: number
  averageRating: number
}

export interface JWTPayload {
  userId: number
  email: string
  role: UserRole
}