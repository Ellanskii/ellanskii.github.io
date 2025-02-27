export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@nuxtjs/color-mode',
    '@nuxtjs/fontaine'
  ],

  app: {
    head: {
      title: 'My Personal Site',
      meta: [
        { name: 'description', content: 'My personal site with CV and articles' },
      ],
    },
  },

  colorMode: {
    classSuffix: '',
  },

  devtools: { enabled: true },

  nitro: {
    prerender: {
      routes: ['/', '/cv', '/articles']
    }
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2025-02-26'
})