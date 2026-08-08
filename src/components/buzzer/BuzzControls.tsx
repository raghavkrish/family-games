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
    if (!ready || !ref.current || prefersReducedMotion() || disabled) return;
    const btn = ref.current;
    const enter = () => gsap.to(btn, { scale: 1.05, duration: 0.15 });
    const leave = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: "elastic.out(1,0.4)" });
    btn.addEventListener("pointerenter", enter);
    btn.addEventListener("pointerleave", leave);
    const idle = gsap.to(btn, {
      scale: 1.04,
      duration: 0.7,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 0.4,
    });
    return () => {
      btn.removeEventListener("pointerenter", enter);
      btn.removeEventListener("pointerleave", leave);
      idle.kill();
      gsap.set(btn, { scale: 1 });
    };
  }, [ready, disabled]);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={() => {
        if (ref.current && !prefersReducedMotion()) {
          gsap.fromTo(
            ref.current,
            { scale: 1.05 },
            {
              scale: 0.78,
              yoyo: true,
              repeat: 1,
              duration: 0.07,
              ease: "power4.in",
            },
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
  lockedTeam,
  submittedAnswer,
  onCorrect,
  onWrong,
  onNext,
  onStart,
  mode,
}: {
  lockedByName?: string;
  lockedTeam?: "a" | "b" | null;
  submittedAnswer?: string | null;
  onCorrect: () => void;
  onWrong: () => void;
  onNext: () => void;
  /** If omitted, Open Buzzers is hidden (games opens buzzers automatically). */
  onStart?: () => void;
  mode: string;
}) {
  const teamChip =
    lockedTeam === "a"
      ? "bg-coral text-ink"
      : lockedTeam === "b"
        ? "bg-cyan text-ink"
        : "bg-cream/10 text-cream";

  return (
    <div className="relative z-50 flex flex-wrap gap-2">
      {mode === "idle" && onStart && (
        <button type="button" className="btn-chunky bg-acid" onClick={onStart}>
          Open Buzzers
        </button>
      )}
      {mode === "locked" && (
        <>
          <span className={`rounded-lg border-2 border-ink px-3 py-2 font-display text-sm shadow-[3px_3px_0_#111] ${teamChip}`}>
            {lockedByName ?? "Team"} buzzed
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
      {mode === "reveal" && (
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
