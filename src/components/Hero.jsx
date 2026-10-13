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
</video><script>(function(){var v=document.currentScript.previousElementSibling,d=document.documentElement;function end(){v.autoplay=false;v.pause();var s=function(){v.currentTime=${intro.finalFrame}};if(v.readyState>0)s();else v.addEventListener('loadedmetadata',s,{once:true})}if(d.getAttribute('data-intro')!=='play'){v.removeAttribute('autoplay');end();return}function bail(){if(window.__tdIntro||d.getAttribute('data-intro')!=='play')return;d.setAttribute('data-intro','still');d.classList.remove('intro-lock');end()}setTimeout(function(){if(v.currentTime<0.05)bail()},2500);v.addEventListener('ended',bail)})()</script>`

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

    // The finished kitchen (a frame of the video) is the permanent hero background.
    const holdFinalFrame = () => {
      if (!video) return
      video.autoplay = false
      video.pause()
      const seek = () => {
        video.currentTime = intro.finalFrame
      }
      if (video.readyState >= 1) seek()
      else video.addEventListener('loadedmetadata', seek, { once: true })
    }

    if (mode !== 'play') {
      holdFinalFrame()
      return () => {}
    }
    // React now owns the intro; the inline fallback in videoHtml stands down.
    window.__tdIntro = true

    // Captions follow the video's own clock: each one wipes in while its moment is on
    // screen and wipes out after. States: (none) waiting, "in" showing, "out" gone.
    const captions = intro.captions.map((c) => ({ ...c, el: root.current.querySelector(`[data-caption="${c.id}"]`) }))
    const setCaption = (c, state) => {
      if (!c.el || c.el.dataset.state === state) return
      c.el.dataset.state = state
      c.el.setAttribute('aria-hidden', state === 'in' ? 'false' : 'true')
    }
    // Capture the finished-kitchen frame as it plays, so it can fade back in over the
    // empty room at the end from exactly the same camera position.
    const still = root.current.querySelector('[data-hero-final]')
    let captured = false
    const captureFinal = () => {
      try {
        still.width = video.videoWidth
        still.height = video.videoHeight
        still.getContext('2d').drawImage(video, 0, 0)
        captured = true
      } catch {
        captured = false
      }
    }
    let frame = 0
    const tickCaptions = () => {
      const t = video?.currentTime ?? 0
      if (!captured && t >= intro.finalFrame && t < intro.finalFrame + 0.5) captureFinal()
      captions.forEach((c) => {
        // Reading pause: hold the frame, then carry on (skip clears the timer).
        if (c.pauseAt !== undefined && !c.paused && t >= c.pauseAt && !finished) {
          c.paused = true
          video.pause()
          timers.push(setTimeout(() => !finished && video.play().catch(() => {}), c.pause * 1000))
        }
        if (t >= c.from && (c.to === undefined || t < c.to)) setCaption(c, 'in')
        else if (c.el?.dataset.state === 'in') setCaption(c, 'out')
      })
      frame = requestAnimationFrame(tickCaptions)
    }
    frame = requestAnimationFrame(tickCaptions)
    const clearCaptions = () => {
      cancelAnimationFrame(frame)
      captions.forEach((c) => c.el?.dataset.state === 'in' && setCaption(c, 'out'))
    }

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

    const reveal = (reason) => {
      // If the motion code can't load, show the copy rather than leave the hero empty.
      const fallback = setTimeout(showImmediately, 2000)
      loadMotion()
        .then(({ gsap }) => {
          clearTimeout(fallback)
          if (html.dataset.intro !== 'play') return
          const el = root.current
          const block = el.querySelector('[data-hero-block]')
          const logo = el.querySelector('[data-hero-logo] img')
          const desc = el.querySelector('[data-hero-desc]')
          const ctas = el.querySelector('[data-hero-cta]')

          gsap.set([block, logo], { clipPath: 'inset(0% 100% 0% 0%)' })
          gsap.set([desc, ctas], { autoAlpha: 0 })
          // After a natural ending the kitchen fades back in over the empty room first.
          const fadeKitchen = reason === 'time' && captured
          const d = fadeKitchen ? 0.7 : 0
          if (fadeKitchen) gsap.set(still, { autoAlpha: 0 })
          html.dataset.intro = 'reveal'
          moveFocus()

          gsap
            .timeline({
              defaults: { ease: 'power3.out' },
              onComplete: () => {
                gsap.set([block, logo, desc, ctas], { clearProps: 'all' })
                // Hand the background back to the video, paused on the same frame.
                if (fadeKitchen) {
                  holdFinalFrame()
                  video.addEventListener('seeked', () => gsap.to(still, { autoAlpha: 0, duration: 0.2 }), { once: true })
                }
                html.dataset.intro = 'done'
              },
            })
            // 0. The finished kitchen fades back in over the empty room
            .to(still, { autoAlpha: fadeKitchen ? 1 : 0, duration: fadeKitchen ? 0.9 : 0, ease: 'power2.inOut' }, 0)
            // 1. The title block's frame wipes in from the left
            .to(block, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.inOut' }, d)
            // 2. The logo follows, like a line being drawn
            .to(logo, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.inOut' }, d + 0.3)
            // 3. Descriptor, then the calls to action
            .to(desc, { autoAlpha: 1, duration: 0.3 }, d + 0.8)
            .to(ctas, { autoAlpha: 1, duration: 0.35 }, d + 0.9)
        })
        .catch(showImmediately)
    }

    const finish = (reason) => {
      if (finished) return
      finished = true
      timers.forEach(clearTimeout)
      listeners.forEach((off) => off())
      clearCaptions()
      // Near or at the end the video freezes on its own last frame; otherwise jump there.
      if (reason !== 'ended' && reason !== 'time') holdFinalFrame()
      // Keep keyboard focus somewhere sensible when the Skip button disappears.
      focusHeadline = document.activeElement?.hasAttribute('data-skip-intro') ?? false
      unlockScroll()
      reveal(reason)
      root.current.dataset.introEnd = reason
    }

    if (!video) {
      finish('error')
      return () => {}
    }

    // The video freezes on the empty room; hold there (white-boxing caption showing),
    // then reveal the copy.
    let holding = false
    const holdThenReveal = () => {
      if (holding || finished) return
      holding = true
      timers.push(setTimeout(() => finish('time'), intro.holdAfterEnd * 1000))
    }
    on(video, 'ended', holdThenReveal)
    on(video, 'timeupdate', () => Number.isFinite(video.duration) && video.currentTime >= video.duration - 0.06 && holdThenReveal())
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
    // Video length plus the reading pauses and the end hold.
    const expected = 6.8 + intro.captions.reduce((n, c) => n + (c.pause ?? 0), 0) + intro.holdAfterEnd
    timers.push(setTimeout(() => finish('timeout'), Math.max(0, (expected + 3) * 1000 - sinceLoad)))

    const skipButton = root.current.querySelector('[data-skip-intro]')
    on(skipButton, 'click', skip)

    return () => {
      cancelAnimationFrame(frame)
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
      {/* The finished-kitchen frame, captured from the video, for the fade back in. */}
      <canvas data-hero-final aria-hidden="true" className="hero-video invisible opacity-0" />

      {/* Title block: logo, descriptor and actions in one framed panel, bottom left, the
          way a drawing sheet carries its title block. The rest of the room stays clear. */}
      <div className="absolute inset-x-0 bottom-0 px-[var(--margin)] pb-[calc(20px+env(safe-area-inset-bottom,0px))] lg:pb-[clamp(40px,7vh,80px)] lg:pl-[calc(max(0px,(100vw-1360px)/2)+var(--margin))]">
        <div data-hero-block className="hero-reveal w-full border border-ink bg-paper sm:w-fit">
          <h1 id="hero-title" tabIndex={-1} className="px-5 py-5 outline-none sm:px-7 sm:py-6" data-hero-logo>
            <img
              src={hero.logo.src}
              srcSet={`${hero.logo.srcSmall} ${hero.logo.w / 2}w, ${hero.logo.src} ${hero.logo.w}w`}
              sizes="(min-width: 1024px) 32rem, (min-width: 640px) 28rem, 90vw"
              width={hero.logo.w}
              height={hero.logo.h}
              alt={hero.logo.alt}
              decoding="async"
              className="block h-auto w-full max-w-[20rem] sm:w-[28rem] sm:max-w-none lg:w-[32rem]"
            />
            <span className="sr-only"> {hero.headline}</span>
          </h1>
          <p data-hero-desc className="anno border-t border-ink px-5 py-3 sm:px-7">
            {hero.descriptor}
          </p>
          <div data-hero-cta className="flex flex-col gap-3 border-t border-ink p-5 sm:flex-row sm:px-7">
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

      {/* Intro captions, timed to the video (see intro.captions in content.js). */}
      <div className="intro-captions" aria-live="polite">
        {intro.captions.map((c) => (
          <div key={c.id} data-caption={c.id} className="intro-caption" aria-hidden="true">
            <p className="label">{c.label}</p>
            <p className="intro-caption-text mt-2 font-display">{c.text}</p>
          </div>
        ))}
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
