export const useAuth = () => {
  const token = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7
  })

  const user = useState('user', () => null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Login failed')
    }

    if (data.value?.success) {
      token.value = data.value.data.token
      user.value = data.value.data.user
      return data.value.data.user
    }
  }

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: { email, password, name }
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Registration failed')
    }

    if (data.value?.success) {
      token.value = data.value.data.token
      user.value = data.value.data.user
      return data.value.data.user
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const fetchUser = async () => {
    if (!token.value) return

    const { data } = await useFetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (data.value?.success) {
      user.value = data.value.data
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
}