import { db } from '../../db'

export default defineEventHandler(async (event) => {
  const categories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)]
  })
  
  return {
    success: true,
    data: categories
  }
})