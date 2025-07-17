// utils/auth.ts
export const useAuth = () => {
  const AUTH_KEY = 'unefa-auth-session'
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  // Función segura para acceder al almacenamiento
  const getStorage = () => {
    // Solo en cliente
    if (process.client) {
      return {
        session: sessionStorage,
        local: localStorage
      }
    }
    return {
      session: { getItem: () => null, removeItem: () => {}, setItem: () => {} },
      local: { getItem: () => null, removeItem: () => {}, setItem: () => {} }
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
      storage.session.setItem(AUTH_KEY, JSON.stringify(sessionData))
      storage.local.setItem(AUTH_KEY, JSON.stringify(sessionData))
      
      return true
    }
    return false
  }

  // Cerrar sesión
  const logout = () => {
    const storage = getStorage()
    storage.session.removeItem(AUTH_KEY)
    storage.local.removeItem(AUTH_KEY)
    
    if (process.client) {
      router.push('/')
      window.location.reload()
    }
  }

  // Verificar sesión activa
  const isAuthenticated = (): boolean => {
    const storage = getStorage()
    const sessionData = storage.session.getItem(AUTH_KEY) || storage.local.getItem(AUTH_KEY)
    
    if (!sessionData) return false
    
    try {
      const { authenticated, timestamp, expiry } = JSON.parse(sessionData)
      
      // Verificar expiración
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