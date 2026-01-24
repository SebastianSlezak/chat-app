import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { books, bookCategories, categories, reviews } from '../db/schema'
import type { NewBook, BookWithCategories, ReadingStatus } from '~/types'

export async function getUserBooks(userId: number, status?: ReadingStatus) {
  let query = db.query.books.findMany({
    where: status 
      ? and(eq(books.userId, userId), eq(books.status, status))
      : eq(books.userId, userId),
    with: {
      bookCategories: {
        with: {
          category: true
        }
      },
      reviews: {
        where: eq(reviews.userId, userId)
      }
    },
    orderBy: [desc(books.updatedAt)]
  })

  const result = await query

  return result.map(book => ({
    ...book,
    categories: book.bookCategories.map(bc => bc.category),
    review: book.reviews[0] || null,
    bookCategories: undefined,
    reviews: undefined
  })) as BookWithCategories[]
}

export async function getBookById(bookId: number, userId: number) {
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId)),
    with: {
      bookCategories: {
        with: {
          category: true
        }
      },
      reviews: {
        where: eq(reviews.userId, userId)
      }
    }
  })

  if (!book) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }

  return {
    ...book,
    categories: book.bookCategories.map(bc => bc.category),
    review: book.reviews[0] || null,
    bookCategories: undefined,
    reviews: undefined
  } as BookWithCategories
}

export async function createBook(userId: number, data: Omit<NewBook, 'userId'> & { categoryIds?: number[] }) {
  const { categoryIds, ...bookData } = data

  const [newBook] = await db.insert(books).values({
    ...bookData,
    userId,
    currentPage: bookData.currentPage || 0
  }).returning()

  // Add categories
  if (categoryIds && categoryIds.length > 0) {
    await db.insert(bookCategories).values(
      categoryIds.map(categoryId => ({
        bookId: newBook.id,
        categoryId
      }))
    )
  }

  return getBookById(newBook.id, userId)
}

export async function updateBook(bookId: number, userId: number, data: Partial<NewBook> & { categoryIds?: number[] }) {
  const { categoryIds, ...bookData } = data

  // Verify ownership
  const existingBook = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId))
  })

  if (!existingBook) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }

  // Update book
  await db.update(books)
    .set({ ...bookData, updatedAt: new Date() })
    .where(eq(books.id, bookId))

  // Update categories if provided
  if (categoryIds !== undefined) {
    await db.delete(bookCategories).where(eq(bookCategories.bookId, bookId))
    
    if (categoryIds.length > 0) {
      await db.insert(bookCategories).values(
        categoryIds.map(categoryId => ({
          bookId,
          categoryId
        }))
      )
    }
  }

  return getBookById(bookId, userId)
}

export async function deleteBook(bookId: number, userId: number) {
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId))
  })

  if (!book) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }

  await db.delete(books).where(eq(books.id, bookId))
  
  return { success: true }
}

export async function updateBookProgress(bookId: number, userId: number, currentPage: number) {
  const book = await db.query.books.findFirst({
    where: and(eq(books.id, bookId), eq(books.userId, userId))
  })

  if (!book) {
    throw createError({
      statusCode: 404,
      message: 'Book not found'
    })
  }

  if (currentPage > book.totalPages) {
    throw createError({
      statusCode: 400,
      message: 'Current page cannot exceed total pages'
    })
  }

  const updateData: any = {
    currentPage,
    updatedAt: new Date()
  }

  // Auto-update status based on progress
  if (currentPage === 0) {
    updateData.status = 'to_read'
    updateData.startDate = null
  } else if (currentPage > 0 && currentPage < book.totalPages) {
    if (book.status === 'to_read') {
      updateData.status = 'reading'
      updateData.startDate = new Date()
    }
  } else if (currentPage === book.totalPages) {
    updateData.status = 'completed'
    updateData.finishDate = new Date()
    if (!book.startDate) {
      updateData.startDate = new Date()
    }
  }

  await db.update(books)
    .set(updateData)
    .where(eq(books.id, bookId))

  return getBookById(bookId, userId)
}