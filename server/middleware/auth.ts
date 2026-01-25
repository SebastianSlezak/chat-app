import { verifyToken, extractToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/_nuxt_icon']
  if (publicRoutes.some(route => url.pathname.startsWith(route))) {
    return
  }

  if (!url.pathname.startsWith('/api/')) {
    return
  }

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