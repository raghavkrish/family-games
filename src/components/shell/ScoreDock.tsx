"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useShell } from "./ShellContext";
import { scorePop, shellChromeEnter, useGsapReady } from "@/lib/motion";

export function ScoreDock({ children }: { children?: ReactNode }) {
  const { scores, players, density } = useShell();
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const ready = useGsapReady();
  const entered = useRef(false);

  const teamA = scores["team:a"] ?? 0;
  const teamB = scores["team:b"] ?? 0;

  useEffect(() => {
    if (!ready || entered.current || density === "landing") return;
    shellChromeEnter({ dock: dockRef.current });
    entered.current = true;
  }, [ready, density]);

  useEffect(() => {
    if (!ready) return;
    scorePop(aRef.current, teamA);
    scorePop(bRef.current, teamB);
  }, [teamA, teamB, ready]);

  if (density === "landing") {
    return <footer className="shell-dock relative z-20 px-4 py-3">{children}</footer>;
  }

  return (
    <footer
      ref={dockRef}
      className="shell-dock relative z-20 flex flex-wrap items-center justify-between gap-3 border-t-[5px] border-ink bg-ink/90 px-4 py-4 text-cream"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="rounded-2xl border-[3px] border-ink bg-coral px-4 py-2 font-display text-lg text-ink shadow-[4px_4px_0_#ffe566]">
          Team A <span ref={aRef} className="text-2xl">{teamA}</span>
        </div>
        <div className="rounded-2xl border-[3px] border-ink bg-cyan px-4 py-2 font-display text-lg text-ink shadow-[4px_4px_0_#ff2a1f]">
          Team B <span ref={bRef} className="text-2xl">{teamB}</span>
        </div>
        <p className="hidden text-xs text-cream/60 sm:block">
          {players.filter((p) => p.connected && !p.isHost).length} players online
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </footer>
  );
}
