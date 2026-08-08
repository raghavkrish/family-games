"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Flip, useGsapReady } from "@/lib/motion";

export function Stage({ children, stageKey }: { children: ReactNode; stageKey: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const prevKey = useRef(stageKey);

  useEffect(() => {
    if (!ready || !ref.current) return;
    if (prevKey.current === stageKey) return;
    prevKey.current = stageKey;
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
  }, [stageKey, ready, children]);

  return (
    <main
      ref={ref}
      className="shell-stage relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border-4 border-ink bg-stage/80 shadow-[8px_8px_0_#ff3d6e] backdrop-blur-sm"
      style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
      data-stage-key={stageKey}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
        {children}
      </div>
    </main>
  );
}
