"use client";

import { useEffect, useRef } from "react";
import { disposeScene, mountScene, motionBus, playSceneCue, useGsapReady } from "@/lib/motion";
import type { SceneCue } from "@/lib/motion";
import { useShell } from "./ShellContext";

export function SceneLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ready = useGsapReady();
  const { density } = useShell();

  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    if (density === "play") return; // lighter on phones
    mountScene(canvasRef.current);
    playSceneCue("idle");
    const off = motionBus.on("scene", (p) => {
      playSceneCue((p?.cue as SceneCue) ?? "idle");
    });
    const offGame = motionBus.on("game-start", (p) => {
      const id = String(p?.gameId ?? "");
      if (id === "sound-party") playSceneCue("vinyl-spin");
      else if (id === "tamil-charades") playSceneCue("reel-spin");
      else if (
        id === "tent-kottai-movies" ||
        id === "tent-kottai-songs"
      )
        playSceneCue("tent-pop");
    });
    return () => {
      off();
      offGame();
      disposeScene();
    };
  }, [ready, density]);

  if (density === "play") return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70"
      aria-hidden
    />
  );
}
