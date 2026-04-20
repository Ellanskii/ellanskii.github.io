export default defineNuxtConfig({
  modules: [
    '@nuxt/content', 
    '@nuxt/ui', 
    '@vueuse/nuxt', 
    // '@unocss/nuxt',
    '@nuxtjs/fontaine', 
    'nuxt-umami'
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'My Personal Site',
      meta: [
        {
          name: 'description',
          content: 'My personal site with CV and articles',
        },
      ],
      htmlAttrs: {
        // FIXME поправить для i18n
        lang: 'ru-RU',
      },
    },
  },

  colorMode: {
    classSuffix: '',
  },

  devtools: { enabled: true },

  nitro: {
    prerender: {
      routes: ['/', '/resume', '/articles'],
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
    }
  },

  compatibilityDate: '2025-02-26',
});