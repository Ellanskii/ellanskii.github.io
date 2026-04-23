<script setup lang="ts">
const { locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const i18nHead = useLocaleHead()
useHead(() => ({ htmlAttrs: i18nHead.value.htmlAttrs }))
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b border-gray-200 dark:border-gray-800 print:hidden">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
            <NuxtLink :to="localePath({ path: '/' })" class="font-bold hover:text-primary transition-colors">
            {{ $t('site.title') }}
          </NuxtLink>
          <div class="flex items-center gap-6">
            <NuxtLink
              :to="localePath({ path: '/resume' })"
              class="text-sm hover:text-primary transition-colors"
              active-class="text-primary font-medium"
            >
              {{ $t('nav.resume') }}
            </NuxtLink>
            <NuxtLink
              :to="localePath({ path: '/articles' })"
              class="text-sm hover:text-primary transition-colors"
              active-class="text-primary font-medium"
            >
              {{ $t('nav.notes') }}
            </NuxtLink>
            <div class="flex items-center gap-1 text-sm font-medium">
              <NuxtLink
                v-for="loc in locales"
                :key="loc.code"
                :to="switchLocalePath(loc.code)"
                class="px-1 transition-colors"
                :class="locale === loc.code ? 'text-primary' : 'text-gray-400 hover:text-primary'"
              >
                {{ loc.code.toUpperCase() }}
              </NuxtLink>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8 flex-1">
      <slot />
    </main>

    <footer class="mt-auto border-t border-gray-200 dark:border-gray-800 print:hidden">
      <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © {{ new Date().getFullYear() }} {{ $t('footer.copyright') }}
      </div>
    </footer>
  </div>
</template>
