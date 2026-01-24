import jwt from 'jsonwebtoken'
import type { JWTPayload } from '~/types'

export function signToken(payload: JWTPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  })
}

export function verifyToken(token: string): JWTPayload {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function extractToken(event: any): string | null {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}