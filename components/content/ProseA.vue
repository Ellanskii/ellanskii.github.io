<template>
  <NuxtLink
    :href="href"
    :target="isExternal ? '_blank' : target"
    :rel="isExternal ? 'nofollow noopener noreferrer' : undefined"
  >
    <slot />
    <UIcon v-if="isExternal" name="i-carbon-launch" class="inline-block align-text-top" />
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps({
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: undefined,
    required: false,
  },
})

const isExternal = computed(() => /^https?:\/\//.test(props.href))
</script>
