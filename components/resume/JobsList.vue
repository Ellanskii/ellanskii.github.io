<script setup lang="ts">
import jobs from './jobs.json'
</script>

<template>
  <section>
    <h2>Work Experience</h2>
    <ul class="not-prose flex flex-col gap-2">
      <li v-for="(job, index) in jobs" :key="index">
        <UCard variant="solid">
          <template #header>
            <h3>{{ job.company }}</h3>
            <p>{{ job.position }}</p>
          </template>
          
          
          <p>{{ job.period }}</p>
          <p>{{ job.tasks }}</p>
          <p>{{ job.stack }}</p>
        </UCard>
      </li>
    </ul>
  </section>
</template>

<style scoped></style>
