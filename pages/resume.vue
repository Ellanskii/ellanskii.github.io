<script setup lang="ts">
const { data: page } = await useAsyncData('resume', () => queryCollection('content').path('/resume').first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description
})
</script>

<template>
  <div v-if="page" class="prose dark:prose-invert mx-auto">
    <ContentRenderer :value="page" />
  </div>
</template>