import { pgTable, text, varchar, integer, timestamp, boolean, serial, pgEnum, primaryKey, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const readingStatusEnum = pgEnum('reading_status', ['to_read', 'reading', 'completed', 'abandoned'])

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Books table
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  author: varchar('author', { length: 255 }).notNull(),
  isbn: varchar('isbn', { length: 20 }),
  totalPages: integer('total_pages').notNull(),
  currentPage: integer('current_page').default(0).notNull(),
  status: readingStatusEnum('status').default('to_read').notNull(),
  rating: integer('rating'), // 1-5 scale
  coverImage: text('cover_image'),
  startDate: timestamp('start_date'),
  finishDate: timestamp('finish_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Book categories (many-to-many)
export const bookCategories = pgTable('book_categories', {
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' })
}, (table) => ({
  pk: primaryKey({ columns: [table.bookId, table.categoryId] })
}))

// Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  unq: unique().on(table.bookId, table.userId)
}))

// Reading goals table
export const readingGoals = pgTable('reading_goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  targetBooks: integer('target_books').notNull(),
  currentBooks: integer('current_books').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  unq: unique().on(table.userId, table.year)
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  reviews: many(reviews),
  readingGoals: many(readingGoals)
}))

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(users, {
    fields: [books.userId],
    references: [users.id]
  }),
  bookCategories: many(bookCategories),
  reviews: many(reviews)
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookCategories: many(bookCategories)
}))

export const bookCategoriesRelations = relations(bookCategories, ({ one }) => ({
  book: one(books, {
    fields: [bookCategories.bookId],
    references: [books.id]
  }),
  category: one(categories, {
    fields: [bookCategories.categoryId],
    references: [categories.id]
  })
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id]
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id]
  })
}))

export const readingGoalsRelations = relations(readingGoals, ({ one }) => ({
  user: one(users, {
    fields: [readingGoals.userId],
    references: [users.id]
  })
}))