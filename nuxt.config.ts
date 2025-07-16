// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: [],
  app: {
    head: {
      title: 'MachinaLab Finder - UNEFA',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' }
      ],
      link: [
        { rel: 'stylesheet', href: '/assets/bootstrap/bootstrap.min.css' },
        { rel: 'stylesheet', href: '/assets/css/index.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css' }
      ],
      script: [
        {
          src: '/assets/bootstrap/bootstrap.bundle.min.js',
          defer: true,
          tagPosition: 'bodyClose' // Equivalente a body: true en Nuxt 2
        }
      ]
    }
  },
  modules: [],
  plugins: ['~/plugins/supabase'],
    runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_SUPABASE_URL,
      supabaseKey: process.env.NUXT_SUPABASE_KEY
    }
  }

})