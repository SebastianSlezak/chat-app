import { getUserStats, getMonthlyStats, getCategoryStats } from '../../services/statsService'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)
  const year = query.year ? parseInt(query.year as string) : new Date().getFullYear()
  
  const [overview, monthly, categories] = await Promise.all([
    getUserStats(user.userId),
    getMonthlyStats(user.userId, year),
    getCategoryStats(user.userId)
  ])
  
  return {
    success: true,
    data: {
      overview,
      monthly,
      categories
    }
  }
})