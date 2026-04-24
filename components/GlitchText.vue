<script setup lang="ts">
const props = withDefaults(defineProps<{
  tag?: string
  text?: string
  animate?: boolean
  intensity?: number
}>(), {
  tag: 'span',
  animate: false,
  intensity: 3,
})

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const colorMode = useColorMode()
const colorProbe = ref<HTMLElement>()

// Inside <ClientOnly>, document is always available — no import.meta.client needed.
// 'system' fallback reads the <html> class that Nuxt's head script set synchronously.
const resolvedMode = computed<'light' | 'dark'>(() => {
  const v = colorMode.value
  if (v === 'light') return 'light'
  if (v === 'dark') return 'dark'
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
})

const channels = ref({ r: 'rgb(255,0,0)', g: 'rgb(0,255,0)', b: 'rgb(0,0,255)' })

// Canvas normalizes any CSS color format (oklch, P3, hex, rgb, var(...)) to sRGB uint8.
// getComputedStyle may return oklch() on Chrome/Safari when Tailwind v4 color tokens are used.
function resolveColor(colorStr: string): [number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const ctx = canvas.getContext('2d')
  if (!ctx) return [255, 255, 255]
  ctx.fillStyle = colorStr
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

function updateChannels() {
  if (!colorProbe.value) return
  const colorStr = getComputedStyle(colorProbe.value).color
  const isTransparent = !colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)'
  const [r, g, b] = isTransparent
    ? (resolvedMode.value === 'light' ? [0, 0, 0] : [255, 255, 255]) as [number, number, number]
    : resolveColor(colorStr)

  if (resolvedMode.value !== 'light') {
    // screen: pure channel separation — rgb(r,0,0)+rgb(0,g,0)+rgb(0,0,b) = rgb(r,g,b)
    channels.value = { r: `rgb(${r},0,0)`, g: `rgb(0,${g},0)`, b: `rgb(0,0,${b})` }
  } else {
    // multiply: complement-channel separation — rgb(r,255,255)*rgb(255,g,255)*rgb(255,255,b) = rgb(r,g,b)
    channels.value = { r: `rgb(${r},255,255)`, g: `rgb(255,${g},255)`, b: `rgb(255,255,${b})` }
  }
}

const rStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)
const gStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)
const bStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)

let rafId: number | null = null
let glitching = false
let glitchTimeout: ReturnType<typeof setTimeout> | null = null

function rng(max: number) {
  return (Math.random() * 2 - 1) * max
}

function scheduleGlitch() {
  glitchTimeout = setTimeout(() => {
    glitching = true
    glitchTimeout = setTimeout(() => {
      glitching = false
      scheduleGlitch()
    }, 35 + Math.random() * 75)
  }, 80 + Math.random() * 320)
}

function startAnimation() {
  const t0 = performance.now()
  scheduleGlitch()
  function frame(ts: number) {
    const t = (ts - t0) / 1000
    const n = props.intensity
    if (glitching) {
      rStyle.value = { '--dx': `${rng(n * 2)}px`, '--dy': `${rng(n)}px` }
      gStyle.value = { '--dx': `${rng(n * 2)}px`, '--dy': `${rng(n)}px` }
      bStyle.value = { '--dx': `${rng(n * 2)}px`, '--dy': `${rng(n)}px` }
    } else {
      const d = n * 0.4
      rStyle.value = { '--dx': `${Math.sin(t * 0.7) * d}px`, '--dy': `${Math.cos(t * 0.5) * d * 0.5}px` }
      gStyle.value = { '--dx': `${Math.sin(t * 0.9 + 2) * d}px`, '--dy': `${Math.cos(t * 0.6 + 1) * d * 0.5}px` }
      bStyle.value = { '--dx': `${Math.sin(t * 0.8 + 4) * d}px`, '--dy': `${Math.cos(t * 0.7 + 3) * d * 0.5}px` }
    }
    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)
}

function stopAnimation() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  if (glitchTimeout !== null) { clearTimeout(glitchTimeout); glitchTimeout = null }
  rStyle.value = gStyle.value = bStyle.value = { '--dx': '0px', '--dy': '0px' }
}

function onEnter() {
  if (props.animate) return
  const n = props.intensity * 2
  rStyle.value = { '--dx': `${rng(n)}px`, '--dy': `${rng(n * 0.5)}px` }
  gStyle.value = { '--dx': `${rng(n)}px`, '--dy': `${rng(n * 0.5)}px` }
  bStyle.value = { '--dx': `${rng(n)}px`, '--dy': `${rng(n * 0.5)}px` }
}

function onLeave() {
  if (props.animate) return
  rStyle.value = gStyle.value = bStyle.value = { '--dx': '0px', '--dy': '0px' }
}

// post-flush: CSS class and computed color are already up-to-date when we read them
watchEffect(() => { updateChannels() }, { flush: 'post' })

onMounted(() => { if (props.animate) startAnimation() })
onUnmounted(() => stopAnimation())

watch(() => props.animate, (val) => val ? startAnimation() : stopAnimation())
</script>

<template>
  <ClientOnly>
    <component
      :is="tag"
      v-bind="attrs"
      class="glitch-root"
      :class="resolvedMode"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
    >
      <!-- in-flow sizer: gives dimensions + source for getComputedStyle color -->
      <span ref="colorProbe" class="gl-sizer" aria-hidden="true">
        <slot>{{ text }}</slot>
      </span>

      <!-- accessibility -->
      <span v-if="text" class="sr-only">{{ text }}</span>
      <span v-else class="sr-only"><slot /></span>

      <!-- visual layers: color from channel decomposition, blend mode from CSS -->
      <span class="gl-layer" aria-hidden="true" :style="[rStyle, { color: channels.r }]">
        <slot>{{ text }}</slot>
      </span>
      <span class="gl-layer" aria-hidden="true" :style="[gStyle, { color: channels.g }]">
        <slot>{{ text }}</slot>
      </span>
      <span class="gl-layer" aria-hidden="true" :style="[bStyle, { color: channels.b }]">
        <slot>{{ text }}</slot>
      </span>
    </component>

    <template #fallback>
      <component :is="tag" v-bind="attrs" class="glitch-root">
        <slot>{{ text }}</slot>
      </component>
    </template>
  </ClientOnly>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

.glitch-root {
  position: relative;
  display: inline-block;
  /* no color override — inherit naturally so probe reads the real color */
}

.gl-sizer {
  visibility: hidden;
  pointer-events: none;
  user-select: none;
}

.gl-layer {
  position: absolute;
  top: 0; left: 0;
  pointer-events: none;
  user-select: none;
  transform: translate(var(--dx, 0px), var(--dy, 0px));
  transition: transform 0.12s ease;
}

.glitch-root .gl-layer       { mix-blend-mode: screen; }
.glitch-root.light .gl-layer { mix-blend-mode: multiply; }
</style>
