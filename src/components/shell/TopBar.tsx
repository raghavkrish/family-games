"use client";

import { useEffect, useRef } from "react";
import { useShell } from "./ShellContext";
import { stampIn, useGsapReady } from "@/lib/motion";

export function TopBar() {
  const { roomCode, gameLabel, packLabel, density, connected } = useShell();
  const brandRef = useRef<HTMLHeadingElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready) return;
    stampIn(brandRef.current);
    if (codeRef.current) stampIn(codeRef.current);
  }, [ready, roomCode]);

  return (
    <header className="shell-topbar relative z-20 flex items-center justify-between gap-3 px-4 py-3 md:px-6">
      <div>
        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-acid">
          Family Games
        </p>
        <h1
          ref={brandRef}
          className="font-display text-2xl leading-none text-cream md:text-4xl"
          style={{ transformStyle: "preserve-3d" }}
        >
          PARTY HUB
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {packLabel && density !== "landing" && (
          <span className="hidden rounded-full border-2 border-cream/30 bg-ink/50 px-3 py-1 text-xs text-cream/80 sm:inline">
            {packLabel}
          </span>
        )}
        {gameLabel && (
          <span className="rounded-full bg-coral px-3 py-1 font-display text-sm text-ink shadow-[3px_3px_0_#111]">
            {gameLabel}
          </span>
        )}
        {roomCode && (
          <div
            ref={codeRef}
            className="rounded-xl border-4 border-ink bg-acid px-3 py-1 font-display text-xl tracking-widest text-ink shadow-[4px_4px_0_#ff3d6e] md:text-2xl"
          >
            {roomCode}
          </div>
        )}
        {density !== "landing" && (
          <span
            className={`h-3 w-3 rounded-full ${connected ? "bg-acid" : "bg-coral animate-pulse"}`}
            title={connected ? "Connected" : "Reconnecting"}
          />
        )}
      </div>
    </header>
  );
}
