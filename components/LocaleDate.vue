<script setup lang="ts">
defineProps<{ date: string }>()
</script>

<template>
  <ClientOnly>
    {{ new Date(date).toLocaleDateString() }}
    <template #fallback>
      {{ date }}
    </template>
  </ClientOnly>
</template>
