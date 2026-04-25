export default defineNuxtPlugin(() => {
  const SIZE = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return { provide: { faviconCanvas: canvas } }
  const c = ctx

  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(el => el.remove())
  const dynLink = document.createElement('link')
  dynLink.rel = 'icon'
  dynLink.type = 'image/png'
  document.head.appendChild(dynLink)

  type Group = { color: string; rects: [number, number, number, number][] }
  type Offset = { dx: number; dy: number }

  let groups: Group[] = []
  let scale = 2

  function draw(offsets: Offset[]) {
    c.fillStyle = '#fff'
    c.fillRect(0, 0, SIZE, SIZE)
    c.globalCompositeOperation = 'multiply'
    groups.forEach((g, i) => {
      const { dx, dy } = offsets[i] ?? { dx: 0, dy: 0 }
      c.fillStyle = g.color
      for (const [x, y, w, h] of g.rects) {
        c.fillRect((x + dx) * scale, (y + dy) * scale, w * scale, h * scale)
      }
    })
    c.globalCompositeOperation = 'source-over'
    // White background was needed for multiply — punch it out post-draw
    const img = c.getImageData(0, 0, SIZE, SIZE)
    const d = img.data
    for (let i = 0; i < d.length; i += 4) {
      if (d[i]! > 250 && d[i + 1]! > 250 && d[i + 2]! > 250) d[i + 3] = 0
    }
    c.putImageData(img, 0, 0)
  }

  // Worker owns all timing — setInterval in a worker is not throttled on background tabs
  const workerSrc = `
    let glitching = false
    const offsets = [{dx:0,dy:0},{dx:0,dy:0},{dx:0,dy:0}]
    function rng(max) { return (Math.random()*2-1)*max }
    function scheduleGlitch() {
      setTimeout(() => {
        glitching = true
        for (const o of offsets) { o.dx=rng(3); o.dy=rng(2) }
        setTimeout(() => {
          glitching = false
          for (const o of offsets) { o.dx=0; o.dy=0 }
          scheduleGlitch()
        }, 35 + Math.random()*75)
      }, 80 + Math.random()*320)
    }
    const t0 = Date.now()
    setInterval(() => {
      if (!glitching) {
        const t = (Date.now()-t0)/1000
        offsets[0].dx=Math.sin(t*0.7);     offsets[0].dy=Math.cos(t*0.5)*0.5
        offsets[1].dx=Math.sin(t*0.9+2);   offsets[1].dy=Math.cos(t*0.6+1)*0.5
        offsets[2].dx=Math.sin(t*0.8+4);   offsets[2].dy=Math.cos(t*0.7+3)*0.5
      }
      postMessage(offsets.map(o=>({dx:o.dx,dy:o.dy})))
    }, 50)
    scheduleGlitch()
  `

  const url = URL.createObjectURL(new Blob([workerSrc], { type: 'application/javascript' }))
  const worker = new Worker(url)
  URL.revokeObjectURL(url)

  worker.onmessage = ({ data }: MessageEvent<Offset[]>) => {
    if (!groups.length) return
    draw(data)
    dynLink.href = canvas.toDataURL('image/png')
  }

  fetch('/favicon.svg')
    .then(r => r.text())
    .then((svgText) => {
      const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
      scale = SIZE / Number(doc.documentElement.getAttribute('width') ?? 32)
      groups = Array.from(doc.querySelectorAll('g')).map(g => ({
        color: g.querySelector('rect')?.getAttribute('fill') ?? '#000',
        rects: Array.from(g.querySelectorAll('rect')).map(r => [
          Number(r.getAttribute('x') ?? 0), Number(r.getAttribute('y') ?? 0),
          Number(r.getAttribute('width') ?? 0), Number(r.getAttribute('height') ?? 0),
        ] as [number, number, number, number]),
      })).filter(g => g.rects.length > 0)
    })

  return { provide: { faviconCanvas: canvas } }
})
