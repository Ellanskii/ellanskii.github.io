<template>
  <div class="min-h-screen">
    <header class="border-b border-gray-200 dark:border-gray-800">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold">
            My Site
          </NuxtLink>
          <div class="flex items-center gap-4">
            <NuxtLink to="/cv" class="hover:text-primary">
              CV
            </NuxtLink>
            <NuxtLink to="/articles" class="hover:text-primary">
              Articles
            </NuxtLink>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {{ new Date().getFullYear() }} My Personal Site
      </div>
    </footer>
  </div>
</template>