export default defineNuxtConfig({
  compatibilityDate: '2025-01-24',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint'
  ],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  nitro: {
    experimental: {
      openAPI: true
    }
  },

  app: {
    head: {
      title: 'BookTracker - Śledź swój postęp w czytaniu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Aplikacja do śledzenia postępów w czytaniu książek' }
      ]
    }
  }
})