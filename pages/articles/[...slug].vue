<script lang="ts" setup>
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(
  () => `article-${route.path}`,
  async () => {
    // Try locale-specific path first (e.g. /en/articles/foo),
    // fall back to the default path for articles without a translation
    const fallback = locale.value === 'en' ? route.path.replace(/^\/en/, '') : route.path
    return await queryCollection('articles').path(route.path).first()
      ?? await queryCollection('articles').path(fallback).first()
  },
)

useSeoMeta({
  title: data.value?.title,
  description: data.value?.description,
})
</script>

<template>
  <article v-if="data" class="prose dark:prose-invert mx-auto prose-code:before:content-none prose-code:after:content-none">
    <p class="text-sm text-gray-500 dark:text-gray-400 not-prose mb-6">
      <LocaleDate :date="(data.date as string)" />
    </p>
    <ContentRenderer :value="data" />
  </article>
  <div v-else class="prose dark:prose-invert mx-auto">
    <p>Page not found</p>
  </div>
</template>
