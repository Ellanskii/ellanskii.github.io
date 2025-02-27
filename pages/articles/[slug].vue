<template>
  <article class="prose dark:prose-invert mx-auto">
    <div class="mb-8">
      <h1>{{ article.title }}</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <!--{{ new Date(article.date).toLocaleDateString($i18n.locale) }}-->
      </p>
    </div>
    <div v-html="renderedContent" />
  </article>
</template>

<script setup lang="ts">
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

interface Article {
  slug: string
  title: string
  description: string
  date: string
  content: string
}

const articles: Article[] = [
  {
    slug: 'getting-started-with-nuxt3',
    title: 'Getting Started with Nuxt 3',
    description: 'A comprehensive guide to getting started with Nuxt 3 and its amazing features',
    date: '2024-03-01',
    content: `
# Getting Started with Nuxt 3

Nuxt 3 is a powerful framework for building modern web applications. In this article, we'll explore its key features and how to get started.

## Why Nuxt 3?

Nuxt 3 brings several improvements over its predecessor:

- Vue 3 Composition API support
- Nitro server engine
- Hybrid rendering capabilities
- TypeScript support out of the box
- Improved performance

## Setting Up Your First Project

\`\`\`bash
npx nuxi init my-project
cd my-project
npm install
npm run dev
\`\`\`

## Key Features

### 1. File-based Routing

Nuxt uses a file-based routing system. Simply create \`.vue\` files in your \`pages\` directory:

\`\`\`
pages/
  index.vue
  about.vue
  posts/
    [id].vue
\`\`\`

### 2. Auto-imports

Nuxt automatically imports components and composables:

\`\`\`vue
<template>
  <div>
    <TheHeader />
    <h1>{{ title }}</h1>
  </div>
</template>
\`\`\`

## Conclusion

Nuxt 3 makes building Vue applications a breeze with its powerful features and developer-friendly approach.
    `
  },
  {
    slug: 'mastering-typescript',
    title: 'Mastering TypeScript',
    description: 'Essential TypeScript concepts and best practices for modern web development',
    date: '2024-03-02',
    content: `
# Mastering TypeScript

TypeScript has become an essential tool in modern web development. Let's explore some key concepts and best practices.

## Why TypeScript?

TypeScript offers several advantages:

- Static type checking
- Better IDE support
- Enhanced code maintainability
- Improved team collaboration

## Essential Concepts

### Type Annotations

\`\`\`typescript
let name: string = 'John'
let age: number = 30
let isDeveloper: boolean = true
\`\`\`

### Interfaces

\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  age?: number // Optional property
}

const user: User = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
}
\`\`\`

### Generics

\`\`\`typescript
function getFirst<T>(array: T[]): T | undefined {
  return array[0]
}

const first = getFirst([1, 2, 3]) // Type: number
const firstString = getFirst(['a', 'b', 'c']) // Type: string
\`\`\`

## Best Practices

1. Always define return types for functions
2. Use interfaces over type aliases for objects
3. Leverage union types for better type safety
4. Enable strict mode in tsconfig.json

## Conclusion

TypeScript is a powerful tool that can significantly improve your development experience and code quality.
    `
  },
  {
    slug: 'web-performance',
    title: 'Web Performance Optimization',
    description: 'Learn how to optimize your web applications for better performance',
    date: '2024-03-03',
    content: `
# Web Performance Optimization

Performance is crucial for providing a great user experience. Here's how to optimize your web applications.

## Key Performance Metrics

1. First Contentful Paint (FCP)
2. Largest Contentful Paint (LCP)
3. Time to Interactive (TTI)
4. Cumulative Layout Shift (CLS)

## Optimization Techniques

### 1. Image Optimization

\`\`\`html
<!-- Use modern image formats -->
<picture>
  <source type="image/webp" srcset="image.webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
\`\`\`

### 2. Code Splitting

\`\`\`javascript
// Use dynamic imports for route-level code splitting
const MyComponent = () => import('./MyComponent.vue')
\`\`\`

### 3. Caching Strategies

- Implement service workers
- Use proper cache headers
- Leverage browser caching

## Tools for Performance Testing

1. Lighthouse
2. WebPageTest
3. Chrome DevTools Performance panel

## Conclusion

Performance optimization is an ongoing process that requires regular monitoring and updates.
    `
  }
]

const route = useRoute();
const article = articles.find(a => a.slug === route.params.slug);

if (!article) {
  throw createError({
    statusCode: 404,
    message: 'Article not found'
  });
}

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

const renderedContent = marked(article.content);
</script>