import fs from 'fs';

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/ui',
    '@vueuse/nuxt',
    // '@unocss/nuxt',
    '@nuxtjs/fontaine',
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

  // hooks: {
  //   'nitro:build:public-assets'(nitro) {
  //     const outputPath = nitro.options.output.publicDir;
  //     fs.writeFileSync(`${outputPath}/.nojekyll`, '');
  //   },
  // },

  compatibilityDate: '2025-02-26',
});
