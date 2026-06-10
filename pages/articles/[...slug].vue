<script lang="ts" setup>
const route = useRoute()
const { locale } = useI18n()

const { data } = await useAsyncData(
  () => `article-${route.path}`,
  async () => {
    // Map the route path to its locale folder (e.g. /articles/foo -> /ru/articles/foo,
    // /en/articles/foo -> /en/articles/foo), falling back to the default locale
    // for articles without a translation
    const bare = route.path.replace(/^\/en/, '')
    return await queryCollection('articles').path(`/${locale.value}${bare}`).first()
      ?? await queryCollection('articles').path(`/ru${bare}`).first()
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
