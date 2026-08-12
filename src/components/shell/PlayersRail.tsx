"use client";

import { useEffect, useRef } from "react";
import { useShell } from "./ShellContext";
import { shellChromeEnter, useGsapReady } from "@/lib/motion";

export function PlayersRail() {
  const { players, density, scores } = useShell();
  const listRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready || !listRef.current) return;
    const cards = listRef.current.querySelectorAll(".player-chip");
    if (cards.length) shellChromeEnter({ playerChips: cards });
  }, [ready, players.length]);

  if (density === "landing") return null;

  const visible = players.filter((p) => !p.isHost || density === "host");

  return (
    <aside
      className={`shell-players relative z-20 ${
        density === "host"
          ? "hidden w-44 shrink-0 flex-col gap-2 p-3 lg:flex"
          : "flex gap-2 overflow-x-auto px-3 pb-2"
      }`}
    >
      <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-cyan">
        Crew
      </p>
      <div ref={listRef} className={density === "host" ? "flex flex-col gap-2" : "flex gap-2"}>
        {visible.map((p) => {
          const teamColor =
            p.team === "a" ? "bg-coral" : p.team === "b" ? "bg-cyan" : "bg-cream/20";
          return (
            <div
              key={p.id}
              className={`player-chip flex items-center gap-2 rounded-2xl border-2 border-ink px-2 py-1.5 shadow-[3px_3px_0_#07040a] ${teamColor} ${
                density === "play" ? "min-w-[7rem]" : ""
              } ${p.connected ? "" : "opacity-40"}`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-display text-sm text-cream">
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm text-ink">{p.name}</p>
                <p className="text-[10px] text-ink/70">{scores[p.id] ?? 0} pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
