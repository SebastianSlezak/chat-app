import { getUserById } from '../../services/authService'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated'
    })
  }

  const userData = await getUserById(user.userId)
  
  return {
    success: true,
    data: userData
  }
})