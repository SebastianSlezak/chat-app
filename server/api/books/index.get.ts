import { getUserBooks } from '../../services/bookService'
import type { ReadingStatus } from '~/types'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)
  
  const status = query.status as ReadingStatus | undefined
  
  const books = await getUserBooks(user.userId, status)
  
  return {
    success: true,
    data: books
  }
})