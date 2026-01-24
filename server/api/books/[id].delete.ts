import { deleteBook } from '../../services/bookService'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = parseInt(getRouterParam(event, 'id')!)
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid book ID'
    })
  }

  await deleteBook(id, user.userId)
  
  return {
    success: true,
    message: 'Book deleted successfully'
  }
})