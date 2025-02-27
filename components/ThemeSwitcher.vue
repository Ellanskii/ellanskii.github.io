<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="theme in ['light', 'dark', 'system']"
      :key="theme"
      :icon="getThemeIcon(theme)"
      color="gray"
      variant="ghost"
      :class="{ 'text-primary': $colorMode.preference === theme }"
      @click="$colorMode.preference = theme"
      :aria-label="`Turn on ${theme} theme`"
    />
  </div>
</template>

<script setup lang="ts">
const getThemeIcon = (theme: string) => {
  switch (theme) {
    case 'light':
      return 'i-carbon-sun'
    case 'dark':
      return 'i-carbon-moon'
    case 'system':
      return 'i-carbon-screen'
    default:
      return ''
  }
}
</script>