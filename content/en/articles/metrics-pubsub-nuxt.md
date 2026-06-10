---
slug: metrics-pubsub-nuxt
title: "Pub/Sub for analytics in Nuxt: cleaning up tracking chaos"
description: How I replaced a mess of analytics handlers with a Pub/Sub pattern built on Nuxt plugins — and why Custom Events would be enough for that today
date: 2026-06-10
---

# Pub/Sub for analytics in Nuxt: cleaning up tracking chaos

Back when I worked at rabota.ru, we had a problem to solve: cleaning up all the analytics counters scattered around the app. Metrics, retargeting pixels, ad networks — OTM pixels, Facebook, Google, Yandex Metrika. On top of all that, a bunch of custom events.

## How it was

All of this was smeared across the app. Take an "Apply for this job" button, for example — its component had a whole bunch of calls hanging off it:

```vue
<script setup>
function onApply() {
  // core logic
  applyToVacancy()

  // tracking mixed right in
  ym(12345678, 'reachGoal', 'apply_click')
  fbq('track', 'Lead')
  gtag('event', 'apply_click')
  otmPixel.send('apply')
}
</script>
```

And there were dozens of buttons like that, scattered across components. Whenever a new service needed to be added, you had to:

1. Load the script for the new metric (via a plugin or manually in `app.vue`).
2. Walk through the entire app and manually add calls in all the right places.

And removing a service was even worse. You'd delete the metric's script, but calls like `ym(...)` would stay behind in components. Best case — a silent error in the console. Worst case — the app would crash, because the global function those calls referenced no longer existed.

## The fix: Pub/Sub via an emitter and plugins

I rebuilt this around Pub/Sub. The idea is simple:

- On a user action (button click, page navigation, successful form submit), the component emits **one** domain event — without knowing or caring who handles it or how.
- Each tracking service lives in its own `~/plugins/*.client.ts`, subscribes to the events it cares about, and decides what to do with them.

The component shrinks down to this:

```vue
<script setup>
const { $emitter } = useNuxtApp()

function onApply() {
  applyToVacancy()
  $emitter.emit('vacancy:apply', { vacancyId: vacancy.id })
}
</script>
```

The emitter is just a shared event-emitter instance (e.g. `mitt`) injected into the Nuxt context:

```ts
// plugins/emitter.ts
import mitt from 'mitt'

export default defineNuxtPlugin(() => {
  const emitter = mitt()

  return {
    provide: {
      emitter,
    },
  }
})
```

A plugin for a specific metric subscribes to events and decides what to do with them:

```ts
// plugins/metrika.client.ts
export default defineNuxtPlugin(() => {
  const { $emitter } = useNuxtApp()

  // load the counter script
  loadYandexMetrikaScript()

  $emitter.on('vacancy:apply', ({ vacancyId }) => {
    ym(12345678, 'reachGoal', 'apply_click', { vacancyId })
  })
})
```

```ts
// plugins/facebook-pixel.client.ts
export default defineNuxtPlugin(() => {
  const { $emitter } = useNuxtApp()

  loadFacebookPixelScript()

  $emitter.on('vacancy:apply', () => {
    fbq('track', 'Lead')
  })
})
```

Now, removing a service just means deleting one plugin file. Components know nothing about specific metrics and don't break if one of the counters disappears.

## Was this reinventing the wheel?

Once I'd finished, a thought nagged at me: wasn't I just reinventing Google Tag Manager? Conceptually it's very similar — a single entry point for events that independent "tags" subscribe to.

The custom-built solution had real upsides:

- **Type safety.** Events and their payloads can be typed in TypeScript — no "magic strings" in `dataLayer.push`.
- **Code review.** Any change to tracking goes through the same process as the rest of the codebase.

But the downsides were real too:

- **A deploy for every tiny change.** Any change to an event means a frontend release, not a tweak in a visual interface.
- **Marketers can't add events themselves.** In GTM that's a no-code task; here it isn't.

But there was context that outweighed all of that: Russia, 2022. GTM simply wasn't usable at that point, for obvious reasons. So at the time, this solution was fully justified — not a wheel reinvented, but a forced and perfectly workable replacement.

## How I'd do it today

These days, you wouldn't even need a custom emitter for this — Nuxt 4 has a built-in mechanism for it: [Custom Events (Hooks)](https://nuxt.com/docs/4.x/guide/going-further/events).

Same logic, but without your own emitter plugin:

```ts
// the component emits an event via Nuxt hooks
const nuxtApp = useNuxtApp()

function onApply() {
  applyToVacancy()
  nuxtApp.callHook('vacancy:apply', { vacancyId: vacancy.id })
}
```

```ts
// plugins/metrika.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  loadYandexMetrikaScript()

  nuxtApp.hook('vacancy:apply', ({ vacancyId }) => {
    ym(12345678, 'reachGoal', 'apply_click', { vacancyId })
  })
})
```

You can type your custom hooks by extending the `RuntimeNuxtHooks` interface:

```ts
// types/hooks.d.ts
declare module '#app' {
  interface RuntimeNuxtHooks {
    'vacancy:apply': (payload: { vacancyId: string }) => void
  }
}
```

You get the same Pub/Sub setup, the same type safety — but without pulling in a separate package like `mitt` or maintaining your own emitter plugin. The architectural decision stays exactly the same; only the tool underneath changes.
