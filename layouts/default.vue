<script setup lang="ts">
import { NuxtLink } from '#components'
import { en, ru } from '@nuxt/ui/locale'

const { locale, locales, setLocale } = useI18n()
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
          <GlitchText 
            :as="NuxtLink" 
            :to="localePath({ path: '/' })" 
            :text="$t('nav.home')"
            class="outline-none w-8 h-8"
          >
             <UIcon name="i-ellanskii:ie" class="w-8 h-8" />
          </GlitchText>
          <div class="flex items-center gap-6">
            <div class="hidden md:flex items-center gap-6">
              <GlitchText
                :as="NuxtLink" 
                :to="localePath({ path: '/resume' })"
                class="outline-none font-bold"
              >
                {{ $t('nav.resume') }}
              </GlitchText>
              <GlitchText
                :as="NuxtLink" 
                :to="localePath({ path: '/articles' })"
                class="outline-none font-bold"
              >
                {{ $t('nav.articles') }}
              </GlitchText>
            </div>
            <!-- <div class="flex items-center gap-1 text-sm font-medium">
              <NuxtLink
                v-for="loc in locales"
                :key="loc.code"
                :to="switchLocalePath(loc.code)"
                class="px-1 transition-colors"
                :class="locale === loc.code ? 'text-primary' : 'text-gray-400 hover:text-primary'"
              >
                {{ loc.code.toUpperCase() }}
              </NuxtLink>
            </div> -->
            <ULocaleSelect
              :model-value="locale"
              :locales="[en, ru]"
              @update:model-value="setLocale($event as 'en' | 'ru')"
            />
            <UColorModeSwitch />
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
