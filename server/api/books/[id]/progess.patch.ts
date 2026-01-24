import { z } from 'zod'
import { updateBookProgress } from '../../../services/bookService'

const progressSchema = z.object({
  currentPage: z.number().min(0, 'Current page must be 0 or greater')
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

  const validation = progressSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message
    })
  }

  const book = await updateBookProgress(id, user.userId, validation.data.currentPage)
  
  return {
    success: true,
    data: book
  }
})