// utils/auth.ts
export const useAuth = () => {
  const AUTH_KEY = 'unefa-auth-session'
  const router = useRouter()

  // Función segura para acceder al almacenamiento
  const getStorage = () => {
    if (process.client) {
      return sessionStorage
    }
    return {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {}
    }
  }

  // Iniciar sesión
  const login = (username: string, password: string): boolean => {
    const validUsername = 'unefa-ext-zaraza'
    const validPassword = 'unefa-zaraza'

    if (username === validUsername && password === validPassword) {
      const sessionData = {
        authenticated: true,
        user: username,
        timestamp: new Date().getTime(),
        expiry: 2 * 60 * 60 * 1000 // 2 horas de sesión
      }

      const storage = getStorage()
      storage.setItem(AUTH_KEY, JSON.stringify(sessionData))

      return true
    }

    return false
  }

  // Cerrar sesión
  const logout = () => {
    const storage = getStorage()
    storage.removeItem(AUTH_KEY)

    if (process.client) {
      router.push('/')
      window.location.reload()
    }
  }

  // Verificar sesión activa
  const isAuthenticated = (): boolean => {
    const storage = getStorage()
    const sessionData = storage.getItem(AUTH_KEY)

    if (!sessionData) return false

    try {
      const { authenticated, timestamp, expiry } = JSON.parse(sessionData)

      const currentTime = new Date().getTime()
      if (currentTime > timestamp + expiry) {
        logout()
        return false
      }

      return authenticated
    } catch {
      return false
    }
  }

  return { login, logout, isAuthenticated }
}
