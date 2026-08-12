"use client";

import { useEffect, useRef, useState } from "react";
import { buzzBurst, motionBus, useGsapReady } from "@/lib/motion";
import type { Player } from "@shared/types";

const SHOW_MS = 1800;

/** Brief TV notice when a team buzzes — does not block Reveal next. */
export function HostBuzzTakeover({
  lockedPlayer,
}: {
  lockedPlayer: Player | null | undefined;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const team = lockedPlayer?.team;
  const lastId = useRef<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!team || !lockedPlayer) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), SHOW_MS);
    return () => window.clearTimeout(t);
  }, [team, lockedPlayer?.id]);

  useEffect(() => {
    if (!ready || !visible || !panelRef.current || !team || !lockedPlayer) return;
    buzzBurst(panelRef.current);
    if (lastId.current !== lockedPlayer.id) {
      lastId.current = lockedPlayer.id;
      motionBus.emit("buzz-lock", {
        team,
        teamLabel: team === "a" ? "TEAM A" : "TEAM B",
        playerId: lockedPlayer.id,
      });
    }
  }, [ready, visible, team, lockedPlayer]);

  if (!team || !visible) return null;

  const isA = team === "a";
  const label = isA ? "TEAM A" : "TEAM B";
  const bg = isA ? "bg-coral" : "bg-cyan";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-2 z-40 flex justify-center px-3 md:top-3"
      aria-live="polite"
    >
      <div
        ref={panelRef}
        className={`${bg} flex items-center gap-3 rounded-3xl border-[5px] border-ink px-6 py-4 text-ink shadow-[8px_8px_0_#07040a] md:gap-5 md:px-10 md:py-5`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <p className="font-display text-xl uppercase tracking-[0.22em] md:text-3xl">Buzzed!</p>
        <p className="font-display text-4xl leading-none md:text-6xl">{label}</p>
        {lockedPlayer?.name && (
          <p className="hidden text-base text-ink/70 sm:block">{lockedPlayer.name}</p>
        )}
      </div>
    </div>
  );
}
