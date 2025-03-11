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
  <UButton
    :icon="color.value === 'dark' ? 'i-carbon-sun' : 'i-carbon-moon'"
    color="gray"
    variant="ghost"
    @click="toggleTheme"
    :aria-label="`Turn off ${color.preference} theme`"
  />
</template>