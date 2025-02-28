<script lang="ts" setup>
const route = useRoute()
const { data } = await await useAsyncData(() => queryCollection('content').path(route.path).first())

useSeoMeta({
  title: data.value?.title,
  description: data.value?.description
})
</script>

<template>
  <article class="prose dark:prose-invert mx-auto" v-if="data">
    <p class="text-sm text-gray-600 dark:text-gray-400">{{ new Date(data?.meta.date).toLocaleDateString() }}</p>
    <ContentRenderer :value="data" />
  </article>
  <div v-else>Page not found</div>
</template>