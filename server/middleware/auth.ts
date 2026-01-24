import { verifyToken, extractToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  
  // Skip auth for public routes
  const publicRoutes = ['/api/auth/login', '/api/auth/register']
  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return
  }

  // Skip auth for non-API routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Extract and verify token
  const token = extractToken(event)
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required'
    })
  }

  try {
    const payload = verifyToken(token)
    event.context.user = payload
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: 'Invalid or expired token'
    })
  }
})  