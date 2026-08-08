"use client";

import { useEffect, useRef, useState } from "react";
import { motionBus, buzzSlam, correctWipe, prefersReducedMotion, gsap } from "@/lib/motion";

type OverlayKind = "buzz-lock" | "correct" | "wrong" | "game-start" | "round-open" | null;

export function OverlayPortal() {
  const [kind, setKind] = useState<OverlayKind>(null);
  const [label, setLabel] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubs = [
      motionBus.on("buzz-lock", (p) => {
        setLabel(String(p?.teamLabel ?? "BUZZED!"));
        setKind("buzz-lock");
      }),
      motionBus.on("correct", () => {
        setLabel("CORRECT!");
        setKind("correct");
      }),
      motionBus.on("wrong", () => {
        setLabel("NOPE!");
        setKind("wrong");
      }),
      motionBus.on("game-start", (p) => {
        setLabel(String(p?.gameId ?? "LET'S GO").toUpperCase());
        setKind("game-start");
      }),
      motionBus.on("round-open", () => {
        setLabel("BUZZ IN!");
        setKind("round-open");
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!kind || !panelRef.current) return;
    if (kind === "buzz-lock" || kind === "game-start" || kind === "round-open") {
      buzzSlam(panelRef.current);
    } else if (kind === "correct") {
      correctWipe(panelRef.current);
    } else {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, rotate: -8, scale: 0.8 },
        { opacity: 1, rotate: 0, scale: 1, duration: 0.3 },
      );
    }
    const t = window.setTimeout(() => setKind(null), prefersReducedMotion() ? 600 : 1400);
    return () => window.clearTimeout(t);
  }, [kind, label]);

  if (!kind) return null;

  const bg =
    kind === "correct"
      ? "bg-acid text-ink"
      : kind === "wrong"
        ? "bg-coral text-ink"
        : "bg-cream text-ink";

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div
        ref={panelRef}
        className={`${bg} rounded-[2rem] border-8 border-ink px-10 py-8 font-display text-5xl shadow-[12px_12px_0_#111] md:text-8xl`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {label}
      </div>
    </div>
  );
}
