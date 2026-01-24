import { z } from 'zod'
import { createBook } from '../../services/bookService'

const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().optional(),
  totalPages: z.number().min(1, 'Total pages must be at least 1'),
  currentPage: z.number().min(0).optional(),
  status: z.enum(['to_read', 'reading', 'completed', 'abandoned']).optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  categoryIds: z.array(z.number()).optional()
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)
  
  const validation = createBookSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message
    })
  }

  const book = await createBook(user.userId, validation.data)
  
  return {
    success: true,
    data: book
  }
})