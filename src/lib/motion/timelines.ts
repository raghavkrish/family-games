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
    gsap.fromTo(el, { scale: 1 }, { scale: 1.45, yoyo: true, repeat: 1, duration: 0.2 });
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

/** Loud vinyl groove loop; returns a killable tween. */
export function discGroove(el: HTMLElement | null) {
  if (!el) return null;
  gsap.killTweensOf(el);
  if (prefersReducedMotion()) {
    gsap.set(el, { rotate: 0, scale: 1 });
    return null;
  }
  const spin = gsap.to(el, {
    rotate: 360,
    duration: 4.5,
    ease: "none",
    repeat: -1,
  });
  const throb = gsap.to(el, {
    scale: 1.04,
    duration: 0.55,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  return {
    kill() {
      spin.kill();
      throb.kill();
      gsap.set(el, { rotate: 0, scale: 1 });
    },
  };
}

/** Loud stage/shell shake on buzz-lock. */
export function shakeStage(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { x: 0 },
    {
      keyframes: [
        { x: -14, y: 4, duration: 0.04 },
        { x: 14, y: -4, duration: 0.04 },
        { x: -10, y: 3, duration: 0.04 },
        { x: 10, y: -2, duration: 0.04 },
        { x: -5, y: 1, duration: 0.04 },
        { x: 0, y: 0, duration: 0.08 },
      ],
      ease: "power1.inOut",
    },
  );
}

/** Urgent Charades timer nudge when under threshold. */
export function timerNudge(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    {
      scale: 1.14,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    },
  );
  gsap.fromTo(
    el,
    { color: "#ff2a1f" },
    { color: "#ffe566", duration: 0.2, yoyo: true, repeat: 1 },
  );
}

export type HeroEnterCleanup = () => void;

/** Loud landing hero: brand-first enter; stickers float in side rail only. */
export function heroEnter(root: HTMLElement): HeroEnterCleanup {
  const cleanups: Array<() => void> = [];

  if (prefersReducedMotion()) {
    gsap.set(
      root.querySelectorAll(".hero-title, .hero-sub, .hero-cta, .drag-sticker, .lamp-glow"),
      { opacity: 1, clearProps: "transform" },
    );
    return () => undefined;
  }

  const lamp = root.querySelector(".lamp-glow");
  if (lamp instanceof HTMLElement) {
    gsap.fromTo(
      lamp,
      { opacity: 0, scale: 0.4 },
      { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" },
    );
    const pulse = gsap.to(lamp, {
      opacity: 0.7,
      scale: 1.18,
      duration: 1.6,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    cleanups.push(() => pulse.kill());
  }

  const title = root.querySelector(".hero-title");
  if (title instanceof HTMLElement) {
    gsap.fromTo(
      title,
      { opacity: 0, y: 60, scale: 1.45, rotateX: -50 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 0.7,
        ease: "back.out(2.4)",
      },
    );
  }

  const sub = root.querySelector(".hero-sub");
  if (sub instanceof HTMLElement) {
    gsap.fromTo(
      sub,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, delay: 0.22, ease: "power2.out" },
    );
  }

  const ctas = root.querySelectorAll(".hero-cta");
  gsap.fromTo(
    ctas,
    { opacity: 0, y: 48, scale: 0.85 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.28,
      ease: "back.out(2)",
    },
  );

  const path = root.querySelector(".logo-stroke") as SVGPathElement | null;
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" });
  }

  const stickers = Array.from(root.querySelectorAll(".drag-sticker")) as HTMLElement[];
  stickers.forEach((el, i) => {
    const rail =
      (el.closest("[data-sticker-rail]") as HTMLElement | null) ??
      (root.querySelector(".sticker-rail") as HTMLElement | null);
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.3, rotate: gsap.utils.random(-40, 40), y: 40 },
      {
        opacity: 1,
        scale: 1,
        rotate: gsap.utils.random(-14, 14),
        y: 0,
        duration: 0.45,
        delay: 0.2 + i * 0.07,
        ease: "back.out(2.6)",
      },
    );
    const floatTween = gsap.to(el, {
      y: `+=${6 + (i % 3) * 2}`,
      rotate: `+=${2.5 + i * 0.6}`,
      duration: 1.6 + i * 0.15,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: i * 0.1,
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
    gsap.set(root.querySelectorAll(".lobby-qr, .lobby-game, .lobby-team, .lobby-code"), {
      opacity: 1,
      clearProps: "transform",
    });
    return;
  }
  slamIn(root.querySelector(".lobby-qr"), 0);
  slamIn(root.querySelector(".lobby-code"), 0.08);
  slamIn(root.querySelector(".lobby-title"), 0.1);
  const games = root.querySelectorAll(".lobby-game");
  gsap.fromTo(
    games,
    { opacity: 0, y: 50, scale: 0.9, rotateX: -25 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      stagger: 0.1,
      duration: 0.5,
      delay: 0.15,
      ease: "back.out(1.9)",
    },
  );
  staggerPop(root.querySelectorAll(".lobby-team"));
}

/** Pop a team-ready chip when it flips ready. */
export function teamReadyPop(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 0.7, rotate: -6 },
    { scale: 1, rotate: 0, duration: 0.55, ease: "elastic.out(1,0.45)" },
  );
}

/** Press squash for lobby game tiles. */
export function lobbyTilePress(el: HTMLElement | null) {
  if (!el || prefersReducedMotion()) return;
  gsap.fromTo(
    el,
    { scale: 1 },
    { scale: 0.94, yoyo: true, repeat: 1, duration: 0.09, ease: "power3.in" },
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

/** Phase wipe for shell stage key changes. */
export function phaseWipe(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, clearProps: "clipPath" });
    return;
  }
  gsap.fromTo(
    el,
    { clipPath: "inset(0 0 100% 0)", opacity: 1 },
    { clipPath: "inset(0 0 0% 0)", duration: 0.4, ease: "power3.out" },
  );
}

/** Breathing pulse while buzzers are open. Returns cleanup. */
export function buzzOpenPulse(el: HTMLElement | null): (() => void) | undefined {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { scale: 1 });
    return;
  }
  const tween = gsap.to(el, {
    scale: 1.12,
    boxShadow: "0 18px 0 #07040a, 0 0 40px rgba(255,42,31,0.55)",
    duration: 0.48,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
  });
  return () => {
    tween.kill();
    gsap.set(el, { scale: 1, clearProps: "boxShadow" });
  };
}

/** Stamp when this phone locked the buzz. */
export function buzzLocked(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) {
    gsap.set(el, { scale: 1, rotate: 0 });
    return;
  }
  gsap.fromTo(
    el,
    { scale: 1.55, rotate: -12 },
    { scale: 1, rotate: 0, duration: 0.55, ease: "elastic.out(1,0.4)" },
  );
}

/** Soft dim when another team buzzed. */
export function buzzDenied(el: HTMLElement | null) {
  if (!el) return;
  if (prefersReducedMotion()) return;
  gsap.to(el, { scale: 0.92, duration: 0.25, ease: "power2.out" });
}

/** DOM confetti burst from center of parent (or viewport). */
export function confettiBurst(parent: HTMLElement | null, count = 28) {
  if (!parent || prefersReducedMotion()) return;
  const colors = ["#ff2a1f", "#ffe566", "#00f5d4", "#fffaf0", "#ff5a2a"];
  const rect = parent.getBoundingClientRect();
  const originX = rect.width / 2;
  const originY = rect.height * 0.35;
  const bits: HTMLElement[] = [];

  for (let i = 0; i < count; i++) {
    const bit = document.createElement("span");
    bit.className = "pointer-events-none absolute z-[60] rounded-sm";
    bit.style.width = `${6 + Math.random() * 8}px`;
    bit.style.height = `${8 + Math.random() * 10}px`;
    bit.style.background = colors[i % colors.length];
    bit.style.left = `${originX}px`;
    bit.style.top = `${originY}px`;
    bit.style.transform = "translate(-50%, -50%)";
    parent.appendChild(bit);
    bits.push(bit);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const dist = 80 + Math.random() * 160;
    gsap.to(bit, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist + 40 + Math.random() * 80,
      rotate: gsap.utils.random(-180, 180),
      opacity: 0,
      duration: 0.7 + Math.random() * 0.45,
      ease: "power2.out",
      onComplete: () => bit.remove(),
    });
  }
  return () => bits.forEach((b) => b.remove());
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
