"use client";

import { Draggable, ScrollTrigger, gsap, prefersReducedMotion } from "./plugins";

export function slamIn(el: Element | null | undefined, delay = 0) {
  if (!(el instanceof HTMLElement)) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, scale: 1, rotateX: 0 });
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0, scale: 2.2, rotateX: -80, z: 200 },
    {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      z: 0,
      duration: 0.55,
      delay,
      ease: "back.out(2.2)",
    },
  );
}

export function stampIn(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, scale: 1, rotate: 0 });
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0, scale: 3, rotate: -18 },
    { opacity: 1, scale: 1, rotate: -3, duration: 0.4, ease: "expo.out" },
  );
}

export function buzzSlam(el: HTMLElement | null) {
  if (!el) return;
  const tl = gsap.timeline();
  if (prefersReducedMotion()) {
    tl.to(el, { opacity: 1, duration: 0.15 });
    return tl;
  }
  tl.fromTo(
    el,
    { opacity: 0, scale: 0.2, rotateY: 90, z: -400 },
    { opacity: 1, scale: 1.15, rotateY: 0, z: 0, duration: 0.35, ease: "power4.out" },
  ).to(el, { scale: 1, duration: 0.2, ease: "elastic.out(1,0.5)" });
  return tl;
}

/** Louder alias for takeover / overlay buzz moments. */
export function buzzBurst(el: HTMLElement | null) {
  return buzzSlam(el);
}

export function correctWipe(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    return;
  }
  gsap.fromTo(
    el,
    { clipPath: "inset(0 100% 0 0)", opacity: 1 },
    { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "power3.inOut" },
  );
}

export function wrongScatter(els: HTMLElement[]) {
  if (!els.length || prefersReducedMotion()) return;
  els.forEach((el) => {
    gsap.to(el, {
      x: gsap.utils.random(-120, 120),
      y: gsap.utils.random(-80, 80),
      rotate: gsap.utils.random(-40, 40),
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
    });
  });
}

/** Loud wrong-answer overlay punch. */
export function wrongPunch(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.15 });
    return;
  }
  const tl = gsap.timeline();
  tl.fromTo(
    el,
    { opacity: 0, scale: 0.4, rotate: -18, x: -40 },
    { opacity: 1, scale: 1.2, rotate: 4, x: 0, duration: 0.28, ease: "power4.out" },
  )
    .to(el, { scale: 1, rotate: 0, duration: 0.22, ease: "elastic.out(1,0.45)" })
    .to(
      el,
      {
        keyframes: [
          { x: -10, duration: 0.05 },
          { x: 10, duration: 0.05 },
          { x: -6, duration: 0.05 },
          { x: 0, duration: 0.05 },
        ],
      },
      "<",
    );
  return tl;
}

export function pulse(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.to(el, { scale: 1.06, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" });
}

export function staggerPop(els: HTMLElement[] | NodeListOf<Element> | null | undefined) {
  const list = els ? Array.from(els).filter(Boolean) : [];
  if (!list.length) return;
  if (prefersReducedMotion()) {
    gsap.set(list, { opacity: 1, y: 0 });
    return;
  }
  gsap.fromTo(
    list,
    { opacity: 0, y: 40, rotateX: -30 },
    { opacity: 1, y: 0, rotateX: 0, stagger: 0.08, duration: 0.45, ease: "back.out(1.7)" },
  );
}

export function scorePop(el: HTMLElement | null, value: number) {
  if (!el) return;
  const obj = { n: Number(el.textContent) || 0 };
  gsap.to(obj, {
    n: value,
    duration: prefersReducedMotion() ? 0.1 : 0.6,
    ease: "power2.out",
    onUpdate: () => {
      el.textContent = String(Math.round(obj.n));
    },
  });
  if (!prefersReducedMotion()) {
    gsap.fromTo(el, { scale: 1 }, { scale: 1.25, yoyo: true, repeat: 1, duration: 0.18 });
  }
}

/** Soft in-round entrance — clues stay readable. */
export function clueSoftIn(el: Element | null | undefined, delay = 0) {
  if (!(el instanceof HTMLElement)) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, y: 0, scale: 1 });
    return;
  }
  gsap.fromTo(
    el,
    { opacity: 0, y: 16, scale: 0.96 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      delay,
      ease: "power2.out",
    },
  );
}

/** Soft vinyl groove loop; returns a killable tween. */
export function discGroove(el: HTMLElement | null) {
  if (!el) return null;
  gsap.killTweensOf(el);
  if (prefersReducedMotion()) {
    gsap.set(el, { rotate: 0, scale: 1 });
    return null;
  }
  return gsap.to(el, {
    rotate: 360,
    duration: 8,
    ease: "none",
    repeat: -1,
  });
}

/** Brief stage/shell shake on buzz. */
export function shakeStage(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { x: 0 },
    {
      keyframes: [
        { x: -8, y: 2, duration: 0.04 },
        { x: 8, y: -2, duration: 0.04 },
        { x: -5, y: 1, duration: 0.04 },
        { x: 5, y: -1, duration: 0.04 },
        { x: 0, y: 0, duration: 0.06 },
      ],
      ease: "power1.inOut",
    },
  );
}

/** Soft Charades timer nudge when under threshold. */
export function timerNudge(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" },
  );
}

export type HeroEnterCleanup = () => void;

/** Loud landing hero: title/cards enter without covering CTAs; stickers float in side rail only. */
export function heroEnter(root: HTMLElement): HeroEnterCleanup {
  const cleanups: Array<() => void> = [];

  if (prefersReducedMotion()) {
    gsap.set(root.querySelectorAll(".hero-title, .hero-card, .how-step, .drag-sticker"), {
      opacity: 1,
      clearProps: "transform",
    });
    return () => undefined;
  }

  const title = root.querySelector(".hero-title");
  if (title instanceof HTMLElement) {
    // Soft “loud” enter — avoids scale 2.2 slam that overlaps cards below.
    gsap.fromTo(
      title,
      { opacity: 0, y: 24, scale: 1.06 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.5)" },
    );
  }

  staggerPop(root.querySelectorAll(".hero-card"));

  const path = root.querySelector(".logo-stroke") as SVGPathElement | null;
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" });
  }

  const howBlock = root.querySelector(".how-block");
  const steps = root.querySelectorAll(".how-step");
  if (howBlock && steps.length) {
    gsap.from(steps, {
      scrollTrigger: { trigger: howBlock, start: "top 85%" },
      y: 28,
      opacity: 0,
      stagger: 0.1,
      duration: 0.45,
      ease: "back.out(1.4)",
    });
  }

  const stickers = Array.from(root.querySelectorAll(".drag-sticker")) as HTMLElement[];
  stickers.forEach((el, i) => {
    const rail =
      (el.closest("[data-sticker-rail]") as HTMLElement | null) ??
      (root.querySelector(".sticker-rail") as HTMLElement | null);
    const floatTween = gsap.to(el, {
      y: `+=${3 + (i % 2)}`,
      rotate: `+=${1.2 + i * 0.4}`,
      duration: 2 + i * 0.2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: i * 0.12,
    });

    const [drag] = Draggable.create(el, {
      type: "x,y",
      bounds: rail ?? root,
      edgeResistance: 0.9,
      inertia: false,
      onPress() {
        floatTween.pause();
      },
      onRelease() {
        floatTween.resume();
      },
    });
    cleanups.push(() => {
      floatTween.kill();
      drag.kill();
    });
  });

  cleanups.push(() => {
    ScrollTrigger.getAll().forEach((t) => {
      if (t.trigger && root.contains(t.trigger as Node)) t.kill();
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

/** Medium shell chrome mount. */
export function shellChromeEnter(opts: {
  brand?: HTMLElement | null;
  code?: HTMLElement | null;
  playerChips?: NodeListOf<Element> | HTMLElement[] | null;
  dock?: HTMLElement | null;
}) {
  if (opts.brand) stampIn(opts.brand);
  if (opts.code) stampIn(opts.code);
  if (opts.playerChips) staggerPop(opts.playerChips);
  if (opts.dock && !prefersReducedMotion()) {
    gsap.fromTo(
      opts.dock,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", delay: 0.1 },
    );
  }
}

/** Loud host lobby entrance. */
export function lobbyEnter(root: HTMLElement) {
  if (prefersReducedMotion()) {
    gsap.set(root.querySelectorAll(".lobby-qr, .lobby-game, .lobby-team"), {
      opacity: 1,
      clearProps: "transform",
    });
    return;
  }
  stampIn(root.querySelector(".lobby-qr") as HTMLElement | null);
  slamIn(root.querySelector(".lobby-title"), 0.05);
  staggerPop(root.querySelectorAll(".lobby-game"));
  staggerPop(root.querySelectorAll(".lobby-team"));
}

/** Pop a team-ready chip when it flips ready. */
export function teamReadyPop(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 0.85 },
    { scale: 1, duration: 0.45, ease: "elastic.out(1,0.5)" },
  );
}

/** Loud phone team picker. */
export function teamPickerEnter(root: HTMLElement) {
  if (prefersReducedMotion()) {
    gsap.set(root.querySelectorAll(".pick-title, .team-a, .team-b"), {
      opacity: 1,
      clearProps: "transform",
    });
    return;
  }
  slamIn(root.querySelector(".pick-title"));
  slamIn(root.querySelector(".team-a"), 0.08);
  slamIn(root.querySelector(".team-b"), 0.16);
}

/** Soft takeover confirm pulse. */
export function takeoverPulse(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
  );
  pulse(el);
}

/** Soft stage content fade when Flip has little to do. */
export function stageSoftFade(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { opacity: 0.85, scale: 0.985 },
    { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
  );
}

/** Kill tweens / ScrollTriggers scoped to an element tree. */
export function killMotion(scope?: HTMLElement | null) {
  if (scope) {
    gsap.killTweensOf(scope);
    gsap.killTweensOf(scope.querySelectorAll("*"));
  }
  ScrollTrigger.getAll().forEach((t) => {
    if (!scope || (t.trigger && scope.contains(t.trigger as Node))) {
      t.kill();
    }
  });
}
