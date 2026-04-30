<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string | Component
  text?: string
  animate?: boolean
  intensity?: number
}>(), {
  as: 'span',
  animate: false,
  intensity: 7,
})

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()

const colorMode = useColorMode()
const colorProbe = ref<HTMLElement>()
const componentRoot = ref<HTMLElement>()

// Refs for CSS variable binding
const rLayerRef = ref<HTMLElement>()
const gLayerRef = ref<HTMLElement>()
const bLayerRef = ref<HTMLElement>()

// Track link hover state
const isHoveringLink = ref(false)

// Detect if component is a link
const isLink = computed(() => {
  return props.as === 'a' || typeof props.as === 'object'
})

// Check if link is active via CSS classes
const isActiveLinkDetected = computed(() => {
  if (!isLink.value) return false
  const el = componentRoot.value as any
  if (!el) return false
  const classList = el.classList || el.$el?.classList
  if (!classList) return false
  return classList.contains('router-link-active') ||
         classList.contains('router-link-exact-active')
})

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
      rLayerRef.value?.style.setProperty('--dx', `${rng(n * 2)}px`)
      rLayerRef.value?.style.setProperty('--dy', `${rng(n)}px`)
      gLayerRef.value?.style.setProperty('--dx', `${rng(n * 2)}px`)
      gLayerRef.value?.style.setProperty('--dy', `${rng(n)}px`)
      bLayerRef.value?.style.setProperty('--dx', `${rng(n * 2)}px`)
      bLayerRef.value?.style.setProperty('--dy', `${rng(n)}px`)
    } else {
      const d = n * 0.4
      rLayerRef.value?.style.setProperty('--dx', `${Math.sin(t * 0.7) * d}px`)
      rLayerRef.value?.style.setProperty('--dy', `${Math.cos(t * 0.5) * d * 0.5}px`)
      gLayerRef.value?.style.setProperty('--dx', `${Math.sin(t * 0.9 + 2) * d}px`)
      gLayerRef.value?.style.setProperty('--dy', `${Math.cos(t * 0.6 + 1) * d * 0.5}px`)
      bLayerRef.value?.style.setProperty('--dx', `${Math.sin(t * 0.8 + 4) * d}px`)
      bLayerRef.value?.style.setProperty('--dy', `${Math.cos(t * 0.7 + 3) * d * 0.5}px`)
    }
    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)
}

function stopAnimation() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  if (glitchTimeout !== null) { clearTimeout(glitchTimeout); glitchTimeout = null }
}

// Event handlers for links
function onEnter() {
  if (isLink.value) {
    isHoveringLink.value = true
  }
}

function onLeave() {
  if (isLink.value) {
    isHoveringLink.value = false
  }
}

// Determine if animation should run
const shouldAnimate = computed(() => {
  return props.animate || (isHoveringLink.value && isLink.value)
})

// post-flush: CSS class and computed color are already up-to-date when we read them
watchEffect(() => { updateChannels() }, { flush: 'post' })

// When animation stops, remove all inline styles to let CSS rules apply
watch(() => shouldAnimate.value, (animate) => {
  if (!animate) {
    rLayerRef.value?.style.removeProperty('--dx')
    rLayerRef.value?.style.removeProperty('--dy')
    gLayerRef.value?.style.removeProperty('--dx')
    gLayerRef.value?.style.removeProperty('--dy')
    bLayerRef.value?.style.removeProperty('--dx')
    bLayerRef.value?.style.removeProperty('--dy')
  }
}, { flush: 'post' })

// When link loses active status, ensure inline styles are removed
watch(() => isActiveLinkDetected.value, (isActive) => {
  if (!isActive) {
    rLayerRef.value?.style.removeProperty('--dx')
    rLayerRef.value?.style.removeProperty('--dy')
    gLayerRef.value?.style.removeProperty('--dx')
    gLayerRef.value?.style.removeProperty('--dy')
    bLayerRef.value?.style.removeProperty('--dx')
    bLayerRef.value?.style.removeProperty('--dy')
  }
}, { flush: 'post' })

onMounted(() => {
  if (props.animate) startAnimation()
})
onUnmounted(() => stopAnimation())

// Main animation control
watch(() => shouldAnimate.value, (animate) => {
  animate ? startAnimation() : stopAnimation()
})
</script>

<template>
  <ClientOnly>
    <component
      ref="componentRoot"
      :is="as"
      v-bind="attrs"
      class="glitch-root"
      :class="resolvedMode"
      @mouseenter="onEnter"
      @mouseleave="onLeave"
      @focus="onEnter"
      @blur="onLeave"
    >
      <!-- in-flow sizer: gives dimensions + source for getComputedStyle color -->
      <span ref="colorProbe" class="gl-sizer" aria-hidden="true">
        <slot>{{ text }}</slot>
      </span>

      <!-- accessibility -->
      <span v-if="text" class="sr-only">{{ text }}</span>
      <span v-else class="sr-only"><slot /></span>

      <!-- visual layers: color from channel decomposition, blend mode from CSS -->
      <span ref="rLayerRef" class="gl-layer" aria-hidden="true" :style="{ color: channels.r }">
        <slot>{{ text }}</slot>
      </span>
      <span ref="gLayerRef" class="gl-layer" aria-hidden="true" :style="{ color: channels.g }">
        <slot>{{ text }}</slot>
      </span>
      <span ref="bLayerRef" class="gl-layer" aria-hidden="true" :style="{ color: channels.b }">
        <slot>{{ text }}</slot>
      </span>
    </component>

    <template #fallback>
      <component :is="as" v-bind="attrs" class="glitch-root">
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

/* Static glitch effect for active links */
.glitch-root.router-link-active .gl-layer:nth-child(3),
.glitch-root.router-link-exact-active .gl-layer:nth-child(3) {
  --dx: 3px;
  --dy: 2px;
}

.glitch-root.router-link-active .gl-layer:nth-child(4),
.glitch-root.router-link-exact-active .gl-layer:nth-child(4) {
  --dx: -2px;
  --dy: -1px;
}

.glitch-root.router-link-active .gl-layer:nth-child(5),
.glitch-root.router-link-exact-active .gl-layer:nth-child(5) {
  --dx: 2px;
  --dy: 1px;
}

.glitch-root .gl-layer       { mix-blend-mode: screen; }
.glitch-root.light .gl-layer { mix-blend-mode: multiply; }
</style>
