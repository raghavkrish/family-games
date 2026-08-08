"use client";

import { gsap, prefersReducedMotion } from "./plugins";

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
