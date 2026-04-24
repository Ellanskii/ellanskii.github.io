<script setup lang="ts">
const { locale, t } = useI18n()

const contentPath = computed(() => locale.value === 'en' ? '/en/resume' : '/resume')

const { data: page } = await useAsyncData(
  () => `resume-${locale.value}`,
  () => queryCollection('resume').path(contentPath.value).first(),
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: page.value.title,
  ogTitle: page.value.title,
  description: page.value.description,
  ogDescription: page.value.description,
})

function handlePrint() {
  window.print()
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="flex justify-end gap-3 mb-6 print:hidden">
      <UButton
        icon="i-carbon-printer"
        variant="ghost"
        color="neutral"
        @click="handlePrint"
      >
        {{ t('resume.print') }}
      </UButton>
      <UButton
        label="t.me/ellanskii"
        icon="i-logos:telegram"
        variant="subtle"
        color="secondary"
        to="https://t.me/ellanskii"
        target="_blank"
        rel="noopener noreferrer"
        @click="umTrackEvent('tg_link_click')"
      />
    </div>

    <article v-if="page" class="prose dark:prose-invert max-w-none prose-code:before:content-none prose-code:after:content-none">
      <ContentRenderer :value="page" />
    </article>
  </div>
</template>
