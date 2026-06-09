# ellanskii.dev — Project Context

Personal site: CV, blog, portfolio. Author — Ilya Ellanskii, Senior Frontend Developer.

**Primary quality goal: 100/100/100/100 in Lighthouse** (Performance, Accessibility, Best Practices, SEO). Every architectural decision should be weighed against this. The stack already has several optimizations toward it: static prerender, Beasties for critical CSS, `payloadExtraction: false`.

---

## Stack

- **Nuxt 4** + **Vue 3** + **TypeScript** (strict)
- **Nuxt UI v4** — Tailwind v4-based components, color mode (`classSuffix: ''`)
- **@nuxt/content v3** — MDC, SQLite-backed, typed collections via `content.config.ts`
- **@nuxtjs/i18n v10** — `ru` default + `en`, strategy: `prefix_except_default`
- **VueUse** — composables
- **nuxt-umami** — self-hosted analytics (env: `NUXT_UMAMI_HOST`, `NUXT_UMAMI_ID`)
- **Beasties** — critical CSS inlining in the `nitro:build:public-assets` hook
- Package manager: **pnpm**

---

## Project Structure

```
pages/
  index.vue               # home
  resume.vue
  articles/
    index.vue
    [...slug].vue

layouts/
  default.vue

components/
  glitch/                 # glitch-effect components — see components/glitch/CLAUDE.md
  resume/                 # JobsList.vue, ResumeHeader.vue, jobs.json
  LocaleDate.vue
  ThemeSwitcher.vue

content/
  resume.md
  articles/
  en/                     # English content variants

i18n/locales/
  ru.json
  en.json

assets/
  css/main.css            # global styles
  icons/                  # custom Iconify collection, prefix: ellanskii

plugins/
  favicon.client.ts       # animated canvas favicon, ~20fps

public/
  favicon.svg
  avatar.png
```

---

## Deployment

Two independent pipelines:

| Target | URL | How |
|---|---|---|
| GitHub Pages | ellanskii.github.io | push to `master` → GH Actions → `nuxi generate --preset github_pages` |
| Cloudflare Pages | ellanskii.dev | separate CF Pages pipeline |

Build output: `.output/public` (static, fully prerendered).

Prerendered routes declared in `nuxt.config.ts → nitro.prerender.routes`.

---

## Dev Commands

```bash
pnpm dev          # dev server
pnpm generate     # static build
pnpm typecheck    # vue-tsc --noEmit
pnpm lint         # eslint
```

---

## Identity & Design Language

Глитч-эффект — визуальная идентичность сайта: трёхканальное цветовое смещение через `mix-blend-mode`. Детали — в `components/glitch/CLAUDE.md`.

**Logo mark** — geometric "IE" initials: 1 vertical bar + 3 horizontal bars, SVG 64×64 grid.  
**Favicon** — animated canvas in `plugins/favicon.client.ts`, three animation modes: idle drift, hover burst, glitch burst.
