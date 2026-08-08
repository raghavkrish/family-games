"use client";

import { useEffect, useRef, useState } from "react";
import {
  motionBus,
  buzzBurst,
  correctWipe,
  wrongPunch,
  shakeStage,
  prefersReducedMotion,
} from "@/lib/motion";

type OverlayKind = "buzz-lock" | "correct" | "wrong" | "game-start" | "round-open" | null;

export function OverlayPortal() {
  const [kind, setKind] = useState<OverlayKind>(null);
  const [label, setLabel] = useState("");
  const [team, setTeam] = useState<"a" | "b" | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubs = [
      motionBus.on("buzz-lock", (p) => {
        const t = p?.team === "a" || p?.team === "b" ? (p.team as "a" | "b") : null;
        setTeam(t);
        setLabel(
          t === "a" ? "TEAM A!" : t === "b" ? "TEAM B!" : String(p?.teamLabel ?? "BUZZED!"),
        );
        setKind("buzz-lock");
        const stage = document.querySelector(".shell-stage") as HTMLElement | null;
        shakeStage(stage);
      }),
      motionBus.on("correct", () => {
        setTeam(null);
        setLabel("CORRECT!");
        setKind("correct");
      }),
      motionBus.on("wrong", () => {
        setTeam(null);
        setLabel("NOPE!");
        setKind("wrong");
      }),
      motionBus.on("game-start", (p) => {
        setTeam(null);
        setLabel(String(p?.gameId ?? "LET'S GO").toUpperCase());
        setKind("game-start");
      }),
      motionBus.on("round-open", () => {
        setTeam(null);
        setLabel("BUZZ IN!");
        setKind("round-open");
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!kind || !panelRef.current) return;
    if (kind === "buzz-lock" || kind === "game-start") {
      buzzBurst(panelRef.current);
    } else if (kind === "round-open") {
      buzzBurst(panelRef.current);
    } else if (kind === "correct") {
      correctWipe(panelRef.current);
    } else {
      wrongPunch(panelRef.current);
    }
    const hold = prefersReducedMotion()
      ? kind === "buzz-lock"
        ? 700
        : 450
      : kind === "buzz-lock"
        ? 2200
        : kind === "round-open"
          ? 700
          : kind === "wrong"
            ? 1100
            : 1400;
    const t = window.setTimeout(() => setKind(null), hold);
    return () => window.clearTimeout(t);
  }, [kind, label]);

  if (!kind) return null;

  const bg =
    kind === "buzz-lock" && team === "a"
      ? "bg-coral text-ink"
      : kind === "buzz-lock" && team === "b"
        ? "bg-cyan text-ink"
        : kind === "correct"
          ? "bg-acid text-ink"
          : kind === "wrong"
            ? "bg-coral text-ink"
            : "bg-cream text-ink";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={panelRef}
        className={`${bg} flex flex-col items-center rounded-[2rem] border-8 border-ink px-10 py-8 font-display shadow-[12px_12px_0_#111]`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {kind === "buzz-lock" && (
          <span className="mb-2 text-xl tracking-[0.3em] md:text-2xl">BUZZED</span>
        )}
        <span className="text-5xl md:text-8xl">{label}</span>
      </div>
    </div>
  );
}
