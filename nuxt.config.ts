export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-umami',
    // '@nuxt/fonts',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Илья Элланский — Senior Frontend Developer',
      meta: [
        {
          name: 'description',
          content: 'Senior Frontend Developer с 9+ годами опыта. Vue 3, Nuxt 4, TypeScript.',
        },
      ],
      link: [
        // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '16x16 32x32 64x64' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  i18n: {
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    baseUrl: process.env.BASE_URL || 'https://ellanskii.github.io/',
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'root',
    },
  },

  colorMode: {
    classSuffix: '',
  },

  devtools: { enabled: true },

  nitro: {
    prerender: {
      routes: ['/', '/resume', '/articles', '/en', '/en/resume', '/en/articles'],
    },
  },

  typescript: {
    strict: true,
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  hooks: {
    async 'nitro:build:public-assets'(nitro) {
      const { readFileSync, writeFileSync, readdirSync, statSync } = await import('node:fs')
      const { join } = await import('node:path')
      const { default: Beasties } = await import('beasties')

      const outputDir = nitro.options.output.publicDir

      const beasties = new Beasties({
        path: outputDir,
        logLevel: 'silent',
      })

      const findHtml = (dir: string): string[] =>
        readdirSync(dir).flatMap((entry) => {
          const full = join(dir, entry)
          return statSync(full).isDirectory() ? findHtml(full) : full.endsWith('.html') ? [full] : []
        })

      await Promise.all(
        findHtml(outputDir).map(async (file) => {
          const processed = await beasties.process(readFileSync(file, 'utf-8'))
          writeFileSync(file, processed)
        }),
      )
    },
  },

  umami: {
    ignoreLocalhost: true,
    performance: true,
  },

  vite: {
    build: {
      cssCodeSplit: true,
    },
  },

  compatibilityDate: '2025-02-26',
})