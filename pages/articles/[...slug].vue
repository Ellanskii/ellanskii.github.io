<script lang="ts" setup>
const route = useRoute()
const { locale } = useI18n()

const contentPath = computed(() => {
  const path = route.path
  return locale.value === 'en' ? path.replace(/^\/en/, '') : path
})

const { data } = await useAsyncData(
  () => `article-${route.path}`,
  () => queryCollection('articles').path(contentPath.value).first(),
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
