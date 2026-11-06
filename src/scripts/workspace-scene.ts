const root = document.documentElement
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

for (const scene of document.querySelectorAll<HTMLElement>('[data-scene]')) {
  const button = scene.querySelector<HTMLButtonElement>('[data-lamp-toggle]')!
  const cord = scene.querySelector<SVGLineElement>('[data-lamp-cord]')!
  const handle = scene.querySelector<SVGGElement>('[data-lamp-handle]')!
  const artwork = scene.querySelector<SVGSVGElement>('svg')!
  let themeTimer: number | undefined
  let frame: number | undefined
  let distance = 0
  let ignorePointerClick = false
  let gesture: { id: number; x: number; y: number; scale: number; moved: boolean } | undefined
  let theme = root.dataset.theme

  const setLamp = (on: boolean) => {
    scene.dataset.lamp = on ? 'on' : 'off'
    button.setAttribute('aria-pressed', String(on))
    button.title = `Pull to turn the desk lamp ${on ? 'off' : 'on'}`
  }
  const cancelThemeTimer = () => {
    window.clearTimeout(themeTimer)
    themeTimer = undefined
  }
  const setPull = (value: number) => {
    distance = value
    cord.setAttribute('y2', String(120 + value))
    handle.setAttribute('transform', `translate(0 ${value})`)
  }
  const stopAnimation = () => {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = undefined
  }
  const animatePull = (target: number, duration: number, done?: () => void) => {
    stopAnimation()
    if (reducedMotion.matches) {
      setPull(target)
      done?.()
      return
    }
    const start = performance.now()
    const from = distance
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setPull(from + (target - from) * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
      else { frame = undefined; done?.() }
    }
    frame = requestAnimationFrame(tick)
  }
  const toggle = () => setLamp(scene.dataset.lamp !== 'on')
  const clickPull = () => {
    cancelThemeTimer()
    toggle()
    animatePull(8, 100, () => animatePull(0, 220))
  }

  // Initial state follows the already-restored theme, without a delayed flash.
  setLamp(root.dataset.theme !== 'light')
  button.disabled = false
  const themeObserver = new MutationObserver(() => {
    if (root.dataset.theme === theme) return
    theme = root.dataset.theme
    cancelThemeTimer()
    themeTimer = window.setTimeout(() => {
      setLamp(root.dataset.theme !== 'light')
      themeTimer = undefined
    }, 2000)
  })
  themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

  button.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return
    stopAnimation()
    setPull(0)
    ignorePointerClick = false
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, scale: artwork.getBoundingClientRect().width / 400, moved: false }
    button.setPointerCapture(event.pointerId)
  })
  button.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return
    const delta = event.clientY - gesture.y
    gesture.moved ||= Math.hypot(event.clientX - gesture.x, delta) > 4
    setPull(Math.max(0, Math.min(10, delta / gesture.scale)))
  })
  button.addEventListener('pointerup', event => {
    if (!gesture || gesture.id !== event.pointerId) return
    const moved = gesture.moved
    gesture = undefined
    ignorePointerClick = true
    button.releasePointerCapture(event.pointerId)
    if (!moved) clickPull()
    else {
      if (distance >= 4) { cancelThemeTimer(); toggle() }
      animatePull(0, 220)
    }
  })
  const cancelGesture = () => {
    if (!gesture) return
    gesture = undefined
    animatePull(0, 220)
  }
  button.addEventListener('pointercancel', cancelGesture)
  button.addEventListener('lostpointercapture', cancelGesture)
  button.addEventListener('click', event => {
    // Pointer releases are handled above; keyboard/assistive clicks use the same pull.
    if (ignorePointerClick && event.detail > 0) { ignorePointerClick = false; return }
    clickPull()
  })
  window.addEventListener('pagehide', () => { cancelThemeTimer(); stopAnimation(); gesture = undefined; setPull(0) })
  window.addEventListener('pageshow', event => {
    if (event.persisted) { cancelThemeTimer(); setLamp(root.dataset.theme !== 'light') }
  })

  let visible = false
  const syncVisibility = () => scene.classList.toggle('is-visible', visible && !document.hidden)
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    syncVisibility()
  })
  visibilityObserver.observe(scene)
  document.addEventListener('visibilitychange', syncVisibility)
}
