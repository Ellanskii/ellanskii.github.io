<template>
  <div class="prose dark:prose-invert mx-auto">
    <h1>Welcome to My Personal Site</h1>
    <p>
      Hi! I'm a professional who loves to share knowledge and experiences.
      Feel free to check out my CV and articles.
    </p>
    <div class="flex gap-4 mt-8">
      <UButton to="/cv" color="primary">
        View My CV
      </UButton>
      <UButton to="/articles" variant="outline">
        Read Articles
      </UButton>
    </div>
  </div>
</template>