"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { TextPlugin } from "gsap/TextPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Draggable } from "gsap/Draggable";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";

let registered = false;

export function registerGsapPlugins() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(
    Flip,
    TextPlugin,
    MotionPathPlugin,
    Draggable,
    Observer,
    ScrollTrigger,
  );
  registered = true;
}

export function useGsapReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    registerGsapPlugins();
    setReady(true);
  }, []);
  return ready;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, Flip, Draggable, Observer, ScrollTrigger, TextPlugin, MotionPathPlugin };
