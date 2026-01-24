import { z } from 'zod'
import { updateBook } from '../../services/bookService'

const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  isbn: z.string().optional(),
  totalPages: z.number().min(1).optional(),
  currentPage: z.number().min(0).optional(),
  status: z.enum(['to_read', 'reading', 'completed', 'abandoned']).optional(),
  rating: z.number().min(1).max(5).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  categoryIds: z.array(z.number()).optional()
})

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = parseInt(getRouterParam(event, 'id')!)
  const body = await readBody(event)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid book ID'
    })
  }

  const validation = updateBookSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message
    })
  }

  const book = await updateBook(id, user.userId, validation.data)
  
  return {
    success: true,
    data: book
  }
})