"use client";

import type { ReactNode } from "react";
import { ShellProvider, type ShellDensity } from "./ShellContext";
import { TopBar } from "./TopBar";
import { PlayersRail } from "./PlayersRail";
import { Stage } from "./Stage";
import { ScoreDock } from "./ScoreDock";
import { OverlayPortal } from "./OverlayPortal";
import { SceneLayer } from "./SceneLayer";
import type { RoomState } from "@shared/types";

export function PartyShell({
  density,
  room,
  isHost,
  connected,
  gameLabel,
  packLabel,
  stageKey,
  stage,
  dock,
}: {
  density: ShellDensity;
  room?: RoomState | null;
  isHost?: boolean;
  connected?: boolean;
  gameLabel?: string;
  packLabel?: string;
  stageKey: string;
  stage: ReactNode;
  dock?: ReactNode;
}) {
  return (
    <ShellProvider
      density={density}
      room={room}
      isHost={isHost}
      connected={connected}
      gameLabel={gameLabel}
      packLabel={packLabel}
    >
      <div className="party-shell relative flex min-h-dvh flex-col overflow-hidden bg-ink text-cream">
        <div className="party-noise pointer-events-none absolute inset-0 z-0 opacity-40" />
        <SceneLayer />
        <TopBar />
        <div
          className={`relative z-10 flex min-h-0 flex-1 gap-3 px-3 pb-3 md:px-5 ${
            density === "host" ? "flex-row" : "flex-col"
          }`}
        >
          <PlayersRail />
          <Stage stageKey={stageKey}>{stage}</Stage>
        </div>
        <ScoreDock>{dock}</ScoreDock>
        <OverlayPortal />
      </div>
    </ShellProvider>
  );
}
