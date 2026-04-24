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

const color = useColorMode()

const rStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)
const gStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)
const bStyle = ref({ '--dx': '0px', '--dy': '0px' } as Record<string, string>)

let rafId: number | null = null

function rng(max: number) {
  return (Math.random() * 2 - 1) * max
}

let glitching = false
let glitchTimeout: ReturnType<typeof setTimeout> | null = null

function scheduleGlitch() {
  const pause = 80 + Math.random() * 320
  glitchTimeout = setTimeout(() => {
    glitching = true
    const duration = 35 + Math.random() * 75
    glitchTimeout = setTimeout(() => {
      glitching = false
      scheduleGlitch()
    }, duration)
  }, pause)
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
      const drift = n * 0.4
      rStyle.value = { '--dx': `${Math.sin(t * 0.7) * drift}px`, '--dy': `${Math.cos(t * 0.5) * drift * 0.5}px` }
      gStyle.value = { '--dx': `${Math.sin(t * 0.9 + 2) * drift}px`, '--dy': `${Math.cos(t * 0.6 + 1) * drift * 0.5}px` }
      bStyle.value = { '--dx': `${Math.sin(t * 0.8 + 4) * drift}px`, '--dy': `${Math.cos(t * 0.7 + 3) * drift * 0.5}px` }
    }

    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)
}

function stopAnimation() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  if (glitchTimeout !== null) { clearTimeout(glitchTimeout); glitchTimeout = null }
  rStyle.value = { '--dx': '0px', '--dy': '0px' }
  gStyle.value = { '--dx': '0px', '--dy': '0px' }
  bStyle.value = { '--dx': '0px', '--dy': '0px' }
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
  rStyle.value = { '--dx': '0px', '--dy': '0px' }
  gStyle.value = { '--dx': '0px', '--dy': '0px' }
  bStyle.value = { '--dx': '0px', '--dy': '0px' }
}

onMounted(() => { if (props.animate) startAnimation() })
onUnmounted(() => stopAnimation())

watch(() => props.animate, (val) => {
  if (val) startAnimation()
  else stopAnimation()
})
</script>

<template>
  <component
    :is="tag"
    class="glitch-root"
    :class="color.value"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <span v-if="text" class="sr-only">{{ text }}</span>
    <span v-else class="sr-only"><slot /></span>
    <span class="gl-layer gl-r" aria-hidden="true" :style="rStyle"><slot>{{ text }}</slot></span>
    <span class="gl-layer gl-g" aria-hidden="true" :style="gStyle"><slot>{{ text }}</slot></span>
    <span class="gl-layer gl-b" aria-hidden="true" :style="bStyle"><slot>{{ text }}</slot></span>
  </component>
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
  color: transparent;
}

.gl-layer {
  position: absolute;
  top: 0; left: 0;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  transform: translate(var(--dx, 0px), var(--dy, 0px));
  transition: transform 0.12s ease;
}

/* dark (default) */
.glitch-root .gl-r { color: #ff2020; mix-blend-mode: screen; }
.glitch-root .gl-g { color: #00ee55; mix-blend-mode: screen; }
.glitch-root .gl-b { color: #1a55ff; mix-blend-mode: screen; }

/* light */
.glitch-root.light .gl-r { color: #00b4d8; mix-blend-mode: multiply; }
.glitch-root.light .gl-g { color: #e040a0; mix-blend-mode: multiply; }
.glitch-root.light .gl-b { color: #f5c800; mix-blend-mode: multiply; }
</style>
