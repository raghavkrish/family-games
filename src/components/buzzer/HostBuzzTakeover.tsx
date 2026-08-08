"use client";

import { useEffect, useRef } from "react";
import { buzzBurst, motionBus, useGsapReady } from "@/lib/motion";
import type { Player } from "@shared/types";

/** Full-stage TV takeover when a team buzzes. */
export function HostBuzzTakeover({
  lockedPlayer,
}: {
  lockedPlayer: Player | null | undefined;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const team = lockedPlayer?.team;
  const lastId = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !panelRef.current || !team || !lockedPlayer) return;
    buzzBurst(panelRef.current);
    if (lastId.current !== lockedPlayer.id) {
      lastId.current = lockedPlayer.id;
      motionBus.emit("buzz-lock", {
        team,
        teamLabel: team === "a" ? "TEAM A" : "TEAM B",
        playerId: lockedPlayer.id,
      });
    }
  }, [ready, team, lockedPlayer]);

  if (!team) return null;

  const isA = team === "a";
  const label = isA ? "TEAM A" : "TEAM B";
  const bg = isA ? "bg-coral" : "bg-cyan";

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-ink/70 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        className={`${bg} flex flex-col items-center gap-2 rounded-[2.5rem] border-8 border-ink px-12 py-10 text-ink shadow-[16px_16px_0_#111] md:px-20 md:py-14`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <p className="font-display text-2xl uppercase tracking-[0.35em] md:text-3xl">
          Buzzed!
        </p>
        <p className="font-display text-6xl leading-none md:text-9xl">{label}</p>
        <p className="text-lg text-ink/70 md:text-xl">Waiting for their answer…</p>
      </div>
    </div>
  );
}
