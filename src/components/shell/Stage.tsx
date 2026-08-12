"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Flip, phaseWipe, stageSoftFade, useGsapReady } from "@/lib/motion";

export function Stage({ children, stageKey }: { children: ReactNode; stageKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const prevKey = useRef(stageKey);

  useEffect(() => {
    if (!ready || !ref.current) return;
    if (prevKey.current === stageKey) return;
    prevKey.current = stageKey;
    const inner = ref.current.querySelector(":scope > div") as HTMLElement | null;
    phaseWipe(inner);
    try {
      const state = Flip.getState(ref.current);
      Flip.from(state, {
        duration: 0.45,
        ease: "power2.inOut",
        absolute: true,
        onEnter: (els) =>
          Flip.from(Flip.getState(els), {
            duration: 0.35,
            fade: true,
            scale: true,
          }),
      });
    } catch {
      stageSoftFade(inner);
    }
  }, [stageKey, ready, children]);

  return (
    <main
      ref={ref}
      className="shell-stage relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2.25rem] border-[5px] border-ink bg-stage"
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      data-stage-key={stageKey}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
        {children}
      </div>
    </main>
  );
}
