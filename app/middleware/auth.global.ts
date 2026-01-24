export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !isAuthenticated.value) {
    return navigateTo('/login')
  }

  if (publicPages.includes(to.path) && isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})