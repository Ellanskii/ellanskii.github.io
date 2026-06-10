<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: t('site.title'),
  description: t('site.description'),
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
    <div class="max-w-2xl mx-auto space-y-6">
      <h1 class="text-5xl md:text-7xl font-bold tracking-tight">
        <GlitchText :intensity="15" :animate="true">
          {{ $t('home.name') }}
        </GlitchText>
      </h1>
      <GlitchText :intensity="10" class="text-xl md:text-2xl text-primary font-medium">
        <p>{{ $t('home.role') }}</p>
      </GlitchText>
      <GlitchText class="text-gray-500 dark:text-gray-400 text-lg ">
        {{ $t('home.tagline') }}
      </GlitchText>
      <div class="flex gap-4 justify-center pt-4">
        <UButton :to="localePath({ path: '/resume' })" size="xl">
          {{ $t('home.cta_resume') }}
        </UButton>
        <UButton :to="localePath({ path: '/articles' })" variant="outline" size="xl">
          {{ $t('home.cta_articles') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
