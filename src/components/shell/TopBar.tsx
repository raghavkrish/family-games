"use client";

import { useEffect, useRef } from "react";
import { useShell } from "./ShellContext";
import { shellChromeEnter, useGsapReady } from "@/lib/motion";

export function TopBar() {
  const { roomCode, gameLabel, packLabel, density, connected } = useShell();
  const brandRef = useRef<HTMLHeadingElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const entered = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!entered.current) {
      shellChromeEnter({ brand: brandRef.current, code: codeRef.current });
      entered.current = true;
      return;
    }
    if (codeRef.current) shellChromeEnter({ code: codeRef.current });
  }, [ready, roomCode]);

  return (
    <header className="shell-topbar relative z-20 flex items-center justify-between gap-3 px-4 py-4 md:px-6">
      <div>
        <p className="font-display text-[11px] uppercase tracking-[0.35em] text-acid party-shimmer">
          Live terrace night
        </p>
        <h1
          ref={brandRef}
          className="font-display text-3xl leading-none text-cream drop-shadow-[3px_3px_0_#ff2a1f] md:text-5xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          KOLLYWOOD GAMES NIGHT
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {packLabel && density !== "landing" && (
          <span className="hidden rounded-full border-2 border-cream/40 bg-ink/60 px-3 py-1.5 text-xs text-cream/90 sm:inline">
            {packLabel}
          </span>
        )}
        {gameLabel && (
          <span className="rounded-full border-2 border-ink bg-coral px-4 py-1.5 font-display text-sm text-ink shadow-[4px_4px_0_#07040a] party-bob">
            {gameLabel}
          </span>
        )}
        {roomCode && (
          <div
            ref={codeRef}
            className="rounded-2xl border-4 border-ink bg-acid px-4 py-2 font-display text-2xl tracking-[0.2em] text-ink shadow-[6px_6px_0_#ff2a1f] md:text-3xl"
          >
            {roomCode}
          </div>
        )}
        {density !== "landing" && (
          <span
            className={`h-3.5 w-3.5 rounded-full border-2 border-ink ${connected ? "bg-acid" : "bg-coral animate-pulse"}`}
            title={connected ? "Connected" : "Reconnecting"}
          />
        )}
      </div>
    </header>
  );
}
