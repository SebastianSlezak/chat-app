export default defineNuxtPlugin(async () => {
  const { isAuthenticated, fetchUser } = useAuth()

  if (isAuthenticated.value) {
    await fetchUser()
  }
})
