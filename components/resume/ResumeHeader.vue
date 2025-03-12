<script setup lang="ts"></script>

<template>
  <header>
    <h1>
      <span class="text-3xl">Илья Элланский</span><br>
      <span class="text-(--ui-primary)">Senior Frontend Developer</span>
    </h1>
  </header>
  <footer class="not-prose flex gap-2">
    <UButton 
      label="t.me/ellanski" 
      icon="i-logos:telegram" 
      variant="subtle"
      color="primary"
      size="lg"
      class="rounded-full"
      to="https://t.me/ellanski" 
      target="_blank" 
      rel="noopener noreferrer"
    />
  </footer>
  <p class="lead">Experienced in building scalable web applications and passionate about modern web technologies.</p>
</template>

<style scoped></style>
