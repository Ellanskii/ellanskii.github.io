---
slug: animated-favicon
title: Анимированный фавикон через Canvas и Web Worker
description: Туториал о том, как оживить иконку вкладки — с прозрачностью, фоновым воркером и правильной работой в неактивных вкладках
date: 2026-04-25
---

# Анимированный фавикон через Canvas и Web Worker

Фавикон — маленькая деталь, которую пользователь видит всегда, даже когда вкладка свёрнута. Это делает его неожиданно удобным местом для передачи информации: количество непрочитанных сообщений, статус фоновой задачи, визуальный «пинг» при получении уведомления.

## Юзкейсы

- **Уведомления** — Gmail меняет иконку при новом письме; то же можно сделать для чатов, дашбордов, очередей задач.
- **Индикатор фоновой активности** — загрузка файла, рендер, синхронизация: пульсирующая иконка говорит «я работаю».
- **Идентификация вкладки** — в приложениях, где пользователь открывает несколько вкладок одного сайта (разные аккаунты, разные документы), анимация помогает найти нужную.
- **Пасхалки** — просто потому что можно.

## Базовый механизм

Браузер читает фавикон из `<link rel="icon">`. Если поменять `href` этого элемента — иконка обновится. Canvas умеет экспортировать содержимое в data URL. Склеиваем:

```js
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 64
const ctx = canvas.getContext('2d')

const link = document.querySelector('link[rel="icon"]')

function drawFrame(t) {
  ctx.clearRect(0, 0, 64, 64)
  // ... рисуем что-то в зависимости от t ...
  link.href = canvas.toDataURL('image/png')
}

function loop(ts) {
  drawFrame(ts / 1000)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)
```

`toDataURL` на холсте 64×64 — дешёвая операция, но гнать её в каждом кадре всё равно избыточно. Достаточно ~20 fps:

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

## Проблема: Chrome игнорирует не-последний фавикон

Если в `<head>` уже есть один или несколько `<link rel="icon">`, Chrome не гарантирует, что возьмёт именно тот, `href` которого вы меняете. На практике побеждает последний в DOM.

Chrome не переподцепляет фавикон динамически: добавление нового `<link>` в конец `<head>` при уже существующих не даёт эффекта — браузер держится за тот, который подцепил первым. Единственный надёжный способ — **удалить все существующие** ссылки перед добавлением динамической, а при остановке — восстановить статичную.

```js
// Сохраняем оригиналы до того, как трогаем DOM
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

## Прозрачный фон

Canvas по умолчанию прозрачен, но некоторые техники рисования требуют белого фона — например, `globalCompositeOperation = 'multiply'` для смешения цветовых слоёв. После отрисовки белые пиксели можно занулить через `getImageData`:

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

Порог 250 подходит для большинства случаев: чистый белый фон убирается, цветные пиксели остаются.

## Web Worker для фоновых вкладок

`requestAnimationFrame` **замораживается**, когда вкладка уходит в фон. Именно тогда анимация нужна больше всего — пользователь переключился на другую вкладку и должен заметить изменение.

`setInterval` в основном потоке тоже ненадёжен: Chrome throttle-ит его до ~1 секунды для фоновых вкладок.

Решение — **Web Worker**. Воркер живёт независимо от видимости страницы, его таймеры не throttle-ятся так же агрессивно:

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
  // рисуем и обновляем фавикон
  draw(data.x, data.y)
  dynLink.href = canvas.toDataURL('image/png')
}
```

Воркер вычисляет координаты/состояние и присылает их в основной поток, который рисует на canvas. Canvas в воркере недоступен без `OffscreenCanvas` — для фавикона это излишне.

Blob URL можно отозвать сразу после создания воркера — скрипт уже загружен:

```js
const url = URL.createObjectURL(blob)
const worker = new Worker(url)
URL.revokeObjectURL(url) // OK, воркер работает дальше
```

## Запуск только на фоновой вкладке

Анимировать фавикон, когда страница и так видна, — бессмысленно. `document.visibilitychange` сообщает о переходе вкладки в фон и обратно:

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    start() // добавляем dynLink, воркер начинает обновлять href
  } else {
    stop()  // убираем dynLink, браузер откатывается к статичному SVG
  }
})
```

Воркер при этом можно не останавливать — пусть считает в фоне. Просто игнорируйте его сообщения, когда `dynLink` вне DOM:

```js
worker.onmessage = ({ data }) => {
  if (!document.hidden) return
  draw(data)
  dynLink.href = canvas.toDataURL('image/png')
}
```

## Итог

```js
// Полная схема
const canvas = document.createElement('canvas')
canvas.width = canvas.height = 64
const ctx = canvas.getContext('2d')

const dynLink = document.createElement('link')
dynLink.rel = 'icon'
dynLink.type = 'image/png'

const worker = new Worker(/* blob с setInterval + postMessage */)

worker.onmessage = ({ data }) => {
  if (!document.hidden) return
  // ctx.* — рисуем кадр
  dynLink.href = canvas.toDataURL('image/png')
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    start() // удаляем статику, добавляем dynLink
  } else {
    stop()  // убираем dynLink, восстанавливаем статику
  }
})
```

Пять строк подключения, остальное — логика анимации. Фавикон заработает в любом фреймворке и без него.
