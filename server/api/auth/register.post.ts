import { z } from 'zod'
import { registerUser } from '../../services/authService'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Validate input
  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message
    })
  }

  const result = await registerUser(validation.data)
  
  return {
    success: true,
    data: result
  }
})