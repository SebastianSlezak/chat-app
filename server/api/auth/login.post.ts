import { z } from 'zod'
import { loginUser } from '../../services/authService'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const validation = loginSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message
    })
  }

  const { email, password } = validation.data
  const result = await loginUser(email, password)
  
  return {
    success: true,
    data: result
  }
})