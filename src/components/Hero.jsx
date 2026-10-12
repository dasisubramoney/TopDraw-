import { useEffect, useRef } from 'react'
import { hero, intro, whatsappHref } from '../content.js'
import { SKIP_INTRO, getLenis, loadMotion } from '../lib/motion.js'

// The intro mode is decided before first paint by the inline script in index.html:
//   html[data-intro="play"]   every page load: video plays, copy hidden, scroll locked
//   html[data-intro="still"]  reduced motion: last frame, copy shown
//   html[data-intro="reveal"] the reveal timeline is running
//   html[data-intro="done"]   finished
// With no JavaScript the attribute is absent and everything is visible.

const { sources } = intro

// Rendered as raw HTML so `muted` and `autoplay` are real attributes in the prerendered
// page (React omits `muted` from server markup, which would block autoplay). The inline
// script runs during HTML parsing, before React loads. It stops playback when the intro
// is not due to play, and, until React takes over (window.__tdIntro), it shows the copy
// if nothing has played 2.5 s after load or the video ends: on a slow connection the
// page must not wait for JavaScript to reveal the hero.
const videoHtml = `<video class="hero-video" autoplay muted playsinline preload="auto" disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1">
<source src="${sources.mobile}" type="video/mp4" media="(max-width: 767px)">
<source src="${sources.webm}" type="video/webm">
<source src="${sources.mp4}" type="video/mp4">
</video><script>(function(){var v=document.currentScript.previousElementSibling,d=document.documentElement;function end(){v.autoplay=false;v.pause();var s=function(){v.currentTime=Math.max(0,v.duration-0.05)};if(v.readyState>0)s();else v.addEventListener('loadedmetadata',s,{once:true})}if(d.getAttribute('data-intro')!=='play'){v.removeAttribute('autoplay');end();return}function bail(){if(window.__tdIntro||d.getAttribute('data-intro')!=='play')return;d.setAttribute('data-intro','still');d.classList.remove('intro-lock');end()}setTimeout(function(){if(v.currentTime<0.05)bail()},2500);v.addEventListener('ended',bail)})()</script>`

export default function Hero() {
  const root = useRef(null)
  const media = useRef(null)

  useEffect(() => {
    const html = document.documentElement
    const video = media.current.querySelector('video')
    const mode = html.dataset.intro
    let finished = false
    const timers = []
    const listeners = []
    const on = (target, type, fn, opts) => {
      target.addEventListener(type, fn, opts)
      listeners.push(() => target.removeEventListener(type, fn, opts))
    }

    // Hold on the final frame: the empty room is the permanent hero background.
    const holdLastFrame = () => {
      if (!video) return
      video.autoplay = false
      video.pause()
      const seek = () => {
        if (!Number.isFinite(video.duration)) return
        video.currentTime = Math.max(0, video.duration - 0.05)
      }
      if (video.readyState >= 1) seek()
      else video.addEventListener('loadedmetadata', seek, { once: true })
    }

    if (mode !== 'play') {
      holdLastFrame()
      return () => {}
    }
    // React now owns the intro; the inline fallback in videoHtml stands down.
    window.__tdIntro = true

    // Start fetching GSAP now so it is ready by the time the video ends.
    loadMotion()
    window.scrollTo(0, 0)

    const unlockScroll = () => {
      html.classList.remove('intro-lock')
      getLenis()?.start()
    }

    let focusHeadline = false
    const moveFocus = () => focusHeadline && root.current.querySelector('h1')?.focus({ preventScroll: true })

    const showImmediately = () => {
      html.dataset.intro = 'done'
      moveFocus()
    }

    const reveal = () => {
      // If the motion code can't load, show the copy rather than leave the hero empty.
      const fallback = setTimeout(showImmediately, 2000)
      loadMotion()
        .then(({ gsap, SplitText }) => {
          clearTimeout(fallback)
          if (html.dataset.intro !== 'play') return
          const el = root.current
          const overlay = el.querySelector('[data-hero-overlay]')
          const first = el.querySelectorAll('[data-hero-first]')
          const after = el.querySelectorAll('[data-hero-after]')
          const ctas = el.querySelectorAll('[data-hero-cta]')
          const split = SplitText.create(el.querySelector('h1'), { type: 'lines', mask: 'lines' })

          gsap.set(overlay, { opacity: 0 })
          gsap.set([...first, ...after, ...ctas], { autoAlpha: 0 })
          gsap.set(split.lines, { yPercent: 105 })
          html.dataset.intro = 'reveal'
          moveFocus()

          gsap
            .timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () => {
                split.revert()
                gsap.set([overlay, ...first, ...after, ...ctas], { clearProps: 'all' })
                html.dataset.intro = 'done'
              },
            })
            // 1. Flat white overlay behind the copy
            .to(overlay, { opacity: 0.55, duration: 0.45 }, 0)
            .to(first, { autoAlpha: 1, duration: 0.3 }, 0.1)
            // 2. Headline, line by line, from behind a mask
            .to(split.lines, { yPercent: 0, duration: 0.6, stagger: 0.06 }, 0.25)
            // 3. What/who/why, then the calls to action
            .to(after, { autoAlpha: 1, duration: 0.35 }, 0.7)
            .to(ctas, { autoAlpha: 1, duration: 0.35 }, 0.85)
        })
        .catch(showImmediately)
    }

    const finish = (reason) => {
      if (finished) return
      finished = true
      timers.forEach(clearTimeout)
      listeners.forEach((off) => off())
      // Near or at the end the video freezes on its own last frame; otherwise jump there.
      if (reason !== 'ended' && reason !== 'time') holdLastFrame()
      // Keep keyboard focus somewhere sensible when the Skip button disappears.
      focusHeadline = document.activeElement?.hasAttribute('data-skip-intro') ?? false
      unlockScroll()
      reveal()
      root.current.dataset.introEnd = reason
    }

    if (!video) {
      finish('error')
      return () => {}
    }

    const revealAt = () => Math.min(intro.revealAt, (Number.isFinite(video.duration) ? video.duration : 99) - 0.05)
    on(video, 'ended', () => finish('ended'))
    on(video, 'timeupdate', () => video.currentTime >= revealAt() && finish('time'))
    on(video, 'error', () => finish('error'))
    const lastSource = video.querySelector('source:last-of-type')
    if (lastSource) on(lastSource, 'error', () => finish('error'))
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) finish('error')

    // A scroll or touch attempt, or a nav click, counts as skip.
    const skip = () => finish('skip')
    on(window, 'wheel', skip, { passive: true })
    on(window, 'touchstart', skip, { passive: true })
    on(window, 'keydown', (e) => {
      if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'End', 'Home'].includes(e.key)) skip()
    })
    on(window, SKIP_INTRO, skip)

    // Autoplay blocked, or nothing has played after 2.5 s (slow network): go to the end.
    video.muted = true
    const attempt = video.play()
    if (attempt?.catch) attempt.catch(() => finish('blocked'))
    // Both timers count from navigation start, not from when this code loaded.
    const sinceLoad = performance.now()
    timers.push(setTimeout(() => (video.currentTime < 0.05 || video.paused) && finish('stalled'), Math.max(0, 2500 - sinceLoad)))
    // Playback that starts but stalls part-way still ends within a few seconds of the expected length.
    timers.push(setTimeout(() => finish('timeout'), Math.max(0, (intro.revealAt + 4) * 1000 - sinceLoad)))

    const skipButton = root.current.querySelector('[data-skip-intro]')
    on(skipButton, 'click', skip)

    return () => {
      timers.forEach(clearTimeout)
      listeners.forEach((off) => off())
    }
  }, [])

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      className="relative -mt-[calc(var(--header-h)+1px)] h-[100svh] min-h-[600px] overflow-hidden bg-mist"
    >
      <div ref={media} className="absolute inset-0" dangerouslySetInnerHTML={{ __html: videoHtml }} />

      <div className="absolute inset-x-0 bottom-0 lg:inset-y-0 lg:left-0 lg:right-auto lg:w-[calc(50%+40px)]">
        {/* Flat white overlay behind the copy for legibility. Solid colour, no gradient. */}
        <div data-hero-overlay aria-hidden="true" className="hero-overlay absolute inset-0 bg-paper" />
        <div data-hero-first aria-hidden="true" className="hero-reveal absolute inset-y-0 right-0 hidden w-px bg-rule lg:block" />

        <div className="hero-copy relative flex h-full flex-col justify-end px-[var(--margin)] pb-[calc(28px+env(safe-area-inset-bottom,0px))] pt-7 lg:pb-[clamp(48px,8vh,96px)] lg:pl-[calc(max(0px,(100vw-1360px)/2)+var(--margin))] lg:pr-12 lg:pt-[calc(var(--header-h)+32px)]">
          <p data-hero-first className="hero-reveal label">
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" tabIndex={-1} className="hero-reveal mt-3 text-display-xl outline-none lg:mt-5 lg:text-[length:clamp(2.125rem,6.2svh,var(--text-display-xl))]">
            {hero.headline}
          </h1>
          <p data-hero-after className="hero-reveal mt-4 max-w-[46ch] text-body-l lg:mt-6">
            <span className="sm:hidden">{hero.leadShort}</span>
            <span className="hidden sm:inline">{hero.lead}</span>
          </p>
          <p data-hero-after className="hero-reveal anno mt-3 lg:mt-4">
            {hero.audienceLine}
          </p>
          <div data-hero-cta className="hero-reveal mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:mt-8">
            <a href="#contact" className="btn btn-primary">
              {hero.primaryCta}
            </a>
            <a href={whatsappHref()} target="_blank" rel="noopener" className="btn btn-secondary">
              {hero.secondaryCta} <span className="anno" aria-hidden="true">↗</span>
              <span className="sr-only">(opens WhatsApp)</span>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        data-skip-intro
        className="skip-intro label absolute bottom-[calc(16px+env(safe-area-inset-bottom,0px))] right-[var(--margin)] z-10 min-h-11 bg-paper px-4 underline decoration-rule underline-offset-4"
      >
        Skip intro
      </button>
    </section>
  )
}
