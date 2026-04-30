---
slug: animated-favicon
title: Animated Favicon with Canvas and Web Worker
description: A tutorial on bringing the tab icon to life — with transparency, a background worker, and proper behavior on inactive tabs
date: 2026-04-25
---

# Animated Favicon with Canvas and Web Worker

The favicon is a small detail the user sees at all times, even when the tab is minimized. That makes it a surprisingly useful channel for communicating information: unread message count, background task status, a visual ping on a new notification.

## Use cases

- **Notifications** — Gmail changes the icon when a new email arrives; the same pattern works for chats, dashboards, task queues.
- **Background activity indicator** — file upload, render, sync: a pulsing icon says "I'm working".
- **Tab identification** — in apps where users open multiple tabs of the same site (different accounts, different documents), animation helps find the right one.
- **Easter eggs** — just because you can.

## The basic mechanism

The browser reads the favicon from `<link rel="icon">`. Changing the `href` of that element updates the icon. Canvas can export its contents as a data URL. Put them together:

```js
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 64
const ctx = canvas.getContext('2d')

const link = document.querySelector('link[rel="icon"]')

function drawFrame(t) {
  ctx.clearRect(0, 0, 64, 64)
  // ... draw something based on t ...
  link.href = canvas.toDataURL('image/png')
}

function loop(ts) {
  drawFrame(ts / 1000)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

`toDataURL` on a 64×64 canvas is cheap, but calling it every frame is still wasteful. ~20 fps is plenty:

```js
let lastUpdate = 0

function loop(ts) {
  if (ts - lastUpdate > 50) {
    drawFrame(ts / 1000)
    link.href = canvas.toDataURL('image/png')
    lastUpdate = ts
  }
  requestAnimationFrame(loop)
}
```

## The problem: Chrome won't re-attach a favicon dynamically

Chrome doesn't pick up a newly appended `<link rel="icon">` when others are already present — the browser latches onto whichever one it saw first and ignores subsequent additions. The only reliable approach is to **remove all existing** icon links before adding the dynamic one, and restore them when the animation stops.

```js
// Save originals before touching the DOM
const staticLinks = [...document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')]

const dynLink = document.createElement('link')
dynLink.rel = 'icon'
dynLink.type = 'image/png'

function start() {
  staticLinks.forEach(el => el.remove())
  document.head.appendChild(dynLink)
}

function stop() {
  dynLink.remove()
  staticLinks.forEach(el => document.head.appendChild(el))
}
```

## Transparent background

Canvas is transparent by default, but some drawing techniques require a white background — for example, `globalCompositeOperation = 'multiply'` for blending color layers. After drawing, white pixels can be zeroed out via `getImageData`:

```js
function punchOutWhite(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] > 250 && d[i+1] > 250 && d[i+2] > 250) d[i+3] = 0
  }
  ctx.putImageData(img, 0, 0)
}
```

A threshold of 250 works well in most cases: the white background is removed, colored pixels survive.

## Web Worker for background tabs

`requestAnimationFrame` **freezes** when the tab goes to the background — exactly when the animation is most needed: the user has switched away and needs to notice something changed.

`setInterval` on the main thread is also unreliable: Chrome throttles it to ~1 second for background tabs.

The solution is a **Web Worker**. Workers run independently of page visibility, and their timers are not throttled as aggressively:

```js
const workerSrc = `
  setInterval(() => {
    const t = Date.now() / 1000
    postMessage({
      x: Math.sin(t * 2) * 10,
      y: Math.cos(t * 1.5) * 10,
    })
  }, 50)
`

const blob = new Blob([workerSrc], { type: 'application/javascript' })
const worker = new Worker(URL.createObjectURL(blob))

worker.onmessage = ({ data }) => {
  draw(data.x, data.y)
  dynLink.href = canvas.toDataURL('image/png')
}
```

The worker computes coordinates/state and sends them to the main thread, which draws on the canvas. Canvas is not available inside a worker without `OffscreenCanvas` — for a favicon that's overkill.

The blob URL can be revoked immediately after creating the worker — the script is already loaded:

```js
const url = URL.createObjectURL(blob)
const worker = new Worker(url)
URL.revokeObjectURL(url) // fine, the worker keeps running
```

## Run only on background tabs

Animating the favicon while the page is visible is pointless. `visibilitychange` fires when the tab moves to the background and back:

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    start() // remove static links, add dynLink
  } else {
    stop()  // remove dynLink, restore static links
  }
})
```

The worker doesn't need to be stopped — let it keep running. Just ignore its messages when the tab is visible:

```js
worker.onmessage = ({ data }) => {
  if (!document.hidden) return
  draw(data)
  dynLink.href = canvas.toDataURL('image/png')
}
```

## The full picture

```js
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 64
const ctx = canvas.getContext('2d')

const staticLinks = [...document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')]
const dynLink = document.createElement('link')
dynLink.rel = 'icon'
dynLink.type = 'image/png'

const worker = new Worker(/* blob with setInterval + postMessage */)

worker.onmessage = ({ data }) => {
  if (!document.hidden) return
  // ctx.* — draw the frame
  dynLink.href = canvas.toDataURL('image/png')
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    start() // remove static links, add dynLink
  } else {
    stop()  // remove dynLink, restore static links
  }
})
```

Five lines of wiring, the rest is animation logic. Works in any framework — or none at all.
