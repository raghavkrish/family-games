"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useGsapReady } from "@/lib/motion";

export function BuzzButton({
  disabled,
  onBuzz,
}: {
  disabled?: boolean;
  onBuzz: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready || !ref.current || prefersReducedMotion()) return;
    const btn = ref.current;
    const enter = () => gsap.to(btn, { scale: 1.05, duration: 0.15 });
    const leave = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: "elastic.out(1,0.4)" });
    btn.addEventListener("pointerenter", enter);
    btn.addEventListener("pointerleave", leave);
    return () => {
      btn.removeEventListener("pointerenter", enter);
      btn.removeEventListener("pointerleave", leave);
    };
  }, [ready]);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => {
        if (ref.current && !prefersReducedMotion()) {
          gsap.fromTo(
            ref.current,
            { scale: 1 },
            { scale: 0.85, yoyo: true, repeat: 1, duration: 0.08 },
          );
        }
        onBuzz();
      }}
      className="buzz-btn relative mx-auto flex h-44 w-44 items-center justify-center rounded-full border-8 border-ink bg-coral font-display text-4xl text-ink shadow-[0_12px_0_#111] transition disabled:cursor-not-allowed disabled:opacity-40 md:h-56 md:w-56 md:text-5xl"
      style={{ transformStyle: "preserve-3d" }}
    >
      BUZZ
    </button>
  );
}

export function HostJudgeBar({
  lockedByName,
  submittedAnswer,
  onCorrect,
  onWrong,
  onNext,
  onStart,
  mode,
}: {
  lockedByName?: string;
  submittedAnswer?: string | null;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  onStart: () => void;
  mode: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {mode === "idle" && (
        <button type="button" className="btn-chunky bg-acid" onClick={onStart}>
          Open Buzzers
        </button>
      )}
      {mode === "locked" && (
        <>
          <span className="rounded-lg bg-cream/10 px-3 py-2 text-sm">
            Locked: <strong>{lockedByName ?? "Team"}</strong>
            {submittedAnswer ? ` — “${submittedAnswer}”` : ""}
          </span>
          <button type="button" className="btn-chunky bg-acid" onClick={onCorrect}>
            Correct
          </button>
          <button type="button" className="btn-chunky bg-coral" onClick={onWrong}>
            Wrong
          </button>
        </>
      )}
      {(mode === "reveal") && (
        <button type="button" className="btn-chunky bg-cyan" onClick={onNext}>
          Next clue
        </button>
      )}
      {mode === "open" && (
        <span className="animate-pulse rounded-lg bg-acid px-3 py-2 font-display text-ink">
          Listening for buzz…
        </span>
      )}
    </div>
  );
}
