"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useShell } from "./ShellContext";
import { scorePop, useGsapReady } from "@/lib/motion";

export function ScoreDock({ children }: { children?: ReactNode }) {
  const { scores, players, density } = useShell();
  const aRef = useRef<HTMLSpanElement>(null);
  const bRef = useRef<HTMLSpanElement>(null);
  const ready = useGsapReady();

  const teamA = scores["team:a"] ?? 0;
  const teamB = scores["team:b"] ?? 0;

  useEffect(() => {
    if (!ready) return;
    scorePop(aRef.current, teamA);
    scorePop(bRef.current, teamB);
  }, [teamA, teamB, ready]);

  if (density === "landing") {
    return <footer className="shell-dock relative z-20 px-4 py-3">{children}</footer>;
  }

  return (
    <footer className="shell-dock relative z-20 flex flex-wrap items-center justify-between gap-3 border-t-4 border-ink bg-ink/80 px-4 py-3 text-cream">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-coral px-3 py-1 font-display text-ink shadow-[3px_3px_0_#00f0ff]">
          Team A <span ref={aRef}>{teamA}</span>
        </div>
        <div className="rounded-xl bg-cyan px-3 py-1 font-display text-ink shadow-[3px_3px_0_#ff3d6e]">
          Team B <span ref={bRef}>{teamB}</span>
        </div>
        <p className="hidden text-xs text-cream/60 sm:block">
          {players.filter((p) => p.connected && !p.isHost).length} players online
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </footer>
  );
}
