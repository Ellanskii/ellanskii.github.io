# ellanskii.dev — Project Context

Frontend portfolio site. Domain: `ellanskii.dev`.

---

## Logo & Identity

### Concept
Geometric mark: **one vertical bar + three horizontal bars** (like the letter E with a detached stem — reads as "IE" initials).

The glitch effect is the core idea:
- **Dark theme** → RGB additive glitch (`mix-blend-mode: screen`). Three layers in red `#ff2020`, green `#00ee55`, blue `#1a55ff` overlap to produce **white**.
- **Light theme** → CMY subtractive glitch (`mix-blend-mode: multiply`). Three layers in cyan `#00b4d8`, magenta `#e040a0`, yellow `#f5c800` overlap to produce **black**.

The effect is physically correct — it explains itself through color theory.

### Mark geometry (SVG, 64×64 grid)
```
vertical bar:    x=6  y=6  w=8  h=52
horizontal top:  x=18 y=6  w=38 h=10
horizontal mid:  x=18 y=27 w=30 h=10
horizontal bot:  x=18 y=48 w=38 h=10
```
Middle bar is slightly shorter than top/bottom — gives the E optical balance.

### Logo implementation
Three absolutely-positioned SVG layers, each in one channel color, with `mix-blend-mode: screen` (dark) or `mix-blend-mode: multiply` (light). No canvas, no raster. Pure CSS — scales to any size.

```html
<!-- dark theme example -->
<div class="logo-mark">
  <svg class="layer layer-r" aria-hidden="true"><!-- same paths --></svg>
  <svg class="layer layer-g" aria-hidden="true"><!-- same paths --></svg>
  <svg class="layer layer-b" aria-hidden="true"><!-- same paths --></svg>
  <span class="sr-only">IE</span>
</div>
```

```css
.logo-mark { position: relative; display: inline-block; }
.layer { position: absolute; top: 0; left: 0; mix-blend-mode: screen; }
.layer-r { color: #ff2020; }
.layer-g { color: #00ee55; }
.layer-b { color: #1a55ff; }
```

---

## Animated Favicon

Favicon is rendered via `<canvas>` and pushed to `<link rel="icon">` at ~20fps:

```js
const favCanvas = document.createElement('canvas')
favCanvas.width = 64; favCanvas.height = 64
const favCtx = favCanvas.getContext('2d')
const faviconEl = document.querySelector('link[rel="icon"]')

function drawMark(ctx, size, rx, ry, gx, gy, bx, by) {
  ctx.clearRect(0, 0, size, size)
  const s = size / 64
  const shapes = [
    [6, 6, 8, 52],    // vertical
    [18, 6, 38, 10],  // top H
    [18, 27, 30, 10], // mid H
    [18, 48, 38, 10], // bot H
  ]
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ;[
    { dx: rx, dy: ry, color: '#ff2020' },
    { dx: gx, dy: gy, color: '#00ee55' },
    { dx: bx, dy: by, color: '#1a55ff' },
  ].forEach(ch => {
    ctx.fillStyle = ch.color
    shapes.forEach(([x, y, w, h]) => {
      ctx.fillRect((x + ch.dx) * s, (y + ch.dy) * s, w * s, h * s)
    })
  })
  ctx.restore()
}

// animation loop — update favicon at ~20fps to avoid thrashing
let lastFavUpdate = 0
function frame(ts) {
  // ... compute offsets rx/ry/gx/gy/bx/by from animation mode ...
  if (ts - lastFavUpdate > 50) {
    drawMark(favCtx, 64, rx, ry, gx, gy, bx, by)
    faviconEl.href = favCanvas.toDataURL('image/png')
    lastFavUpdate = ts
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
```

### Animation modes
- **Idle drift** — channels float on slow sine waves, logo "breathes". Default state.
- **Hover burst** — channels fly apart on `mouseenter`, snap back on `mouseleave`.
- **Glitch burst** — random short offsets (35–110ms) with quiet pauses (80–400ms). Good for scroll/notification triggers.

---

## Glitch Text Effect

### Accessibility pattern — critical
Duplicate spans must be hidden from assistive tech and search parsers.

```html
<a href="#" class="glitch">
  <span class="sr-only">link text here</span>       <!-- ✓ DOM, screen reader, SEO -->
  <span class="gl-r" aria-hidden="true">link text here</span>  <!-- ✗ aria/SEO, visual only -->
  <span class="gl-g" aria-hidden="true">link text here</span>
  <span class="gl-b" aria-hidden="true">link text here</span>
</a>
```

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

.glitch {
  position: relative;
  display: inline-block;
  color: transparent; /* hides sr-only text visually without removing from DOM */
}

.glitch [aria-hidden] {
  position: absolute;
  top: 0; left: 0;
  white-space: nowrap;
  mix-blend-mode: screen;    /* switch to multiply on light theme */
  pointer-events: none;
  user-select: none;
  transform: translate(var(--dx, 0px), var(--dy, 0px));
  transition: transform 0.12s ease;
}

.gl-r { color: #ff2020; }
.gl-g { color: #00ee55; }
.gl-b { color: #1a55ff; }
```

### Animating via CSS custom properties
Drive offsets from JS without touching classList:

```js
function setLayers(el, r, g, b) {
  const spans = el.querySelectorAll('[aria-hidden]')
  spans[0]?.style.setProperty('--dx', r[0] + 'px')
  spans[0]?.style.setProperty('--dy', r[1] + 'px')
  spans[1]?.style.setProperty('--dx', g[0] + 'px')
  spans[1]?.style.setProperty('--dy', g[1] + 'px')
  spans[2]?.style.setProperty('--dx', b[0] + 'px')
  spans[2]?.style.setProperty('--dy', b[1] + 'px')
}
```

---

## Theme switching

`mix-blend-mode` must flip with the theme. Recommended approach — CSS class on `<html>`:

```css
/* dark (default) */
.gl-r { color: #ff2020; mix-blend-mode: screen; }
.gl-g { color: #00ee55; mix-blend-mode: screen; }
.gl-b { color: #1a55ff; mix-blend-mode: screen; }

/* light */
html.light .gl-r { color: #00b4d8; mix-blend-mode: multiply; }
html.light .gl-g { color: #e040a0; mix-blend-mode: multiply; }
html.light .gl-b { color: #f5c800; mix-blend-mode: multiply; }
```

The `.gl-*` class names stay the same — only colors and blend mode change.

---

## Files in this repo related to identity

- `animated_favicon_demo.html` — full working demo with all three animation modes and live favicon update. Use as reference implementation.
