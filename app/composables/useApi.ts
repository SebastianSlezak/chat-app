export const useApi = () => {
  const { token } = useAuth()

  const fetchWithAuth = (url: string, options: any = {}) => {
    return $fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token.value ? `Bearer ${token.value}` : ''
      }
    })
  }

  return {
    fetchWithAuth
  }
}