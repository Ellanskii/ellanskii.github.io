<script setup lang="ts">
const { data: articles } = await useAsyncData('articles-list', 
() => queryCollection('content').path('articles').first()
)
</script>

<template>
  <div class="prose dark:prose-invert mx-auto">
    <h1>Articles</h1>

    <pre>{{ articles }}</pre>
    
    <!-- <div class="not-prose">
      <UCard v-for="article in articles" :key="article.slug" class="mb-4">
        <template #header>
          <h2 class="text-xl font-semibold">
            {{ article.title }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ new Date(article.date).toLocaleDateString() }}
          </p>
        </template>
        <p>{{ article.description }}</p>
        <template #footer>
          <UButton variant="ghost" :to="`/articles/${article.slug}/`">
            Read More
          </UButton>
        </template>
      </UCard>
    </div> -->
  </div>
</template>

