<script setup lang="ts">
const color = useColorMode()

useHead({
  meta: [{
    id: 'theme-color',
    name: 'theme-color',
    content: () => color.value === 'dark' ? '#222222' : '#ffffff',
  }],
})

function toggleTheme() {
  color.preference = color.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <ClientOnly>
    <UButton
      :icon="color.value === 'dark' ? 'i-carbon-sun' : 'i-carbon-moon'"
      color="neutral"
      variant="ghost"
      @click="toggleTheme"
      :aria-label="`Turn off ${color.preference} theme`"
    />
    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>