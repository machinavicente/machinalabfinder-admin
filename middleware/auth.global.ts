// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const nuxtApp = useNuxtApp()
  
  // Solo ejecutar en cliente para rutas protegidas
  if (process.client || !to.meta.requiresAuth) {
    const { isAuthenticated } = useAuth()
    
    if (to.meta.requiresAuth && !isAuthenticated()) {
      return navigateTo('/')
    }
    
    if (to.path === '/' && isAuthenticated()) {
      return navigateTo('/')
    }
  }
})