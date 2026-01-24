import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'
import { signToken } from '../utils/jwt'
import type { NewUser, User, JWTPayload } from '~/types'

export async function registerUser(data: { email: string; password: string; name: string }) {
  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email)
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'User with this email already exists'
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Create user
  const [newUser] = await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: 'user'
  }).returning()

  // Generate token
  const token = signToken({
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role
  })

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    },
    token
  }
}

export async function loginUser(email: string, password: string) {
  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.email, email)
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Invalid credentials'
    })
  }

  // Generate token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    token
  }
}

export async function getUserById(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  }
}