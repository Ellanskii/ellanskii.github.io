<template>
  <article class="prose dark:prose-invert mx-auto">
    <ContentDoc v-slot="{ doc }">
      <div class="mb-8">
        <h1>{{ doc.title }}</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ new Date(doc.date).toLocaleDateString() }}</p>
      </div>
      <ContentRenderer :value="doc" />
    </ContentDoc>
  </article>
</template>