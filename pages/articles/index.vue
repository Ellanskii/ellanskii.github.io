<script setup lang="ts">
const { t, locale } = useI18n()

const { data: articles } = await useAsyncData(
  'articles-list',
  () => queryCollection('articles')
    .where('path', 'LIKE', `${locale.value === 'en' ? '/en/articles' : '/articles'}/%`)
    .order('date', 'DESC')
    .all(),
  { watch: [locale] },
)

useSeoMeta({
  title: t('articles.title'),
  description: t('articles.subtitle'),
})
</script>

<template>
  <div class="prose dark:prose-invert mx-auto">
    <h1>{{ $t('articles.title') }}</h1>
    <p class="lead">{{ $t('articles.subtitle') }}</p>

    <div v-if="articles?.length" class="not-prose flex flex-col gap-4 mt-8">
      <UCard
        v-for="article in articles"
        :key="article.path"
        variant="outline"
        class="hover:border-primary transition-colors"
      >
        <template #header>
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-lg font-semibold leading-snug">
              {{ article.title }}
            </h2>
            <span class="text-sm text-gray-400 shrink-0">
              <LocaleDate :date="(article.date as string)" />
            </span>
          </div>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm">
          {{ article.description }}
        </p>
        <template #footer>
          <UButton variant="ghost" size="sm" :to="article.path">
            {{ $t('articles.read_more') }}
          </UButton>
        </template>
      </UCard>
    </div>

    <p v-else class="not-prose text-gray-500 mt-8">
      {{ $t('articles.empty') }}
    </p>
  </div>
</template>
