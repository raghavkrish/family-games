"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { TeamId } from "@shared/types";
import {
  buzzDenied,
  buzzLocked,
  buzzOpenPulse,
  gsap,
  prefersReducedMotion,
  useGsapReady,
} from "@/lib/motion";

export type BuzzPhase = "idle" | "open" | "locked" | "reveal";

function vibrate(pattern: number | number[] = 40) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* ignore */
  }
}

export function PhoneBuzzerStage({
  team,
  title,
  status,
  children,
}: {
  team: TeamId;
  title: string;
  status: string;
  children: ReactNode;
}) {
  const mood = team === "a" ? "team-mood-a" : team === "b" ? "team-mood-b" : "bg-stage";
  const chip =
    team === "a" ? "bg-coral text-ink" : team === "b" ? "bg-cyan text-ink" : "bg-paper text-ink";

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col ${mood} -m-4 rounded-[1.5rem] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:-m-6 md:p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-cream/60">
            {title}
          </p>
          <p
            className={`mt-1 inline-block rounded-full border-2 border-ink px-3 py-1 font-display text-sm shadow-[3px_3px_0_#07040a] ${chip}`}
          >
            {team === "a" ? "Team A" : team === "b" ? "Team B" : "Buzzer"}
          </p>
        </div>
        <p className="max-w-[58%] text-right font-display text-base leading-tight text-cream md:text-lg">
          {status}
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-4 pt-4">
        {children}
      </div>
    </div>
  );
}

export function BuzzButton({
  disabled,
  onBuzz,
  phase = "open",
  lockedByMe = false,
}: {
  disabled?: boolean;
  onBuzz: () => void;
  phase?: BuzzPhase;
  lockedByMe?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const ready = useGsapReady();
  const canBuzz = phase === "open" && !disabled;

  useEffect(() => {
    if (!ready || !ref.current) return;
    const btn = ref.current;
    gsap.killTweensOf(btn);

    if (phase === "open" && !disabled) {
      return buzzOpenPulse(btn);
    }
    if (phase === "locked" && lockedByMe) {
      buzzLocked(btn);
    }
    if (phase === "locked" && !lockedByMe) {
      buzzDenied(btn);
    }
    return () => {
      gsap.killTweensOf(btn);
    };
  }, [ready, phase, disabled, lockedByMe]);

  const label =
    phase === "locked" && lockedByMe
      ? "LOCKED"
      : phase === "locked"
        ? "WAIT"
        : phase === "reveal"
          ? "DONE"
          : phase === "idle"
            ? "WAIT"
            : "BUZZ";

  const tone =
    phase === "locked" && lockedByMe
      ? "bg-acid"
      : phase === "open" && !disabled
        ? "bg-coral"
        : "bg-cream/30";

  return (
    <button
      ref={ref}
      type="button"
      disabled={!canBuzz}
      aria-label={canBuzz ? "Buzz in" : label}
      onClick={() => {
        if (!canBuzz) return;
        vibrate([30, 20, 50]);
        if (ref.current && !prefersReducedMotion()) {
          gsap.fromTo(
            ref.current,
            { scale: 1.12 },
            {
              scale: 0.72,
              yoyo: true,
              repeat: 1,
              duration: 0.09,
              ease: "power4.in",
            },
          );
        }
        onBuzz();
      }}
      className={`buzz-btn relative mx-auto flex aspect-square w-[min(78vw,19rem)] touch-manipulation items-center justify-center rounded-full border-[12px] border-ink font-display text-6xl text-ink shadow-[0_16px_0_#07040a] transition disabled:cursor-not-allowed disabled:opacity-55 md:w-[min(52vw,22rem)] md:text-7xl ${tone}`}
      style={{ transformStyle: "preserve-3d", WebkitTapHighlightColor: "transparent" }}
    >
      {label}
    </button>
  );
}

export function AnswerForm({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="input-chunky w-full py-4 text-center text-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your team’s guess…"
        autoFocus
        autoComplete="off"
        enterKeyHint="send"
      />
      <button type="submit" className="btn-chunky w-full bg-acid py-4 text-xl">
        Send answer
      </button>
    </form>
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
  lastResult,
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
  lastResult?: "correct" | "wrong" | null;
}) {
  const teamChip =
    lockedTeam === "a"
      ? "bg-coral text-ink"
      : lockedTeam === "b"
        ? "bg-cyan text-ink"
        : "bg-cream/10 text-cream";

  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  // One buzz → judge → brief reveal → auto next (no second team chance).
  useEffect(() => {
    if (mode !== "reveal") return;
    const t = window.setTimeout(() => onNextRef.current(), 2200);
    return () => window.clearTimeout(t);
  }, [mode, lastResult]);

  return (
    <div className="relative z-50 flex flex-wrap items-center gap-2">
      {mode === "idle" && onStart && (
        <button type="button" className="btn-chunky bg-acid text-lg" onClick={onStart}>
          Open Buzzers
        </button>
      )}
      {mode === "locked" && (
        <>
          <span
            className={`rounded-xl border-4 border-ink px-4 py-2.5 font-display text-base shadow-[4px_4px_0_#07040a] md:text-lg ${teamChip}`}
          >
            {lockedByName ?? "Team"} buzzed
            {submittedAnswer ? ` — “${submittedAnswer}”` : ""}
          </span>
          <button type="button" className="btn-chunky bg-acid text-lg" onClick={onCorrect}>
            Correct
          </button>
          <button type="button" className="btn-chunky bg-coral text-lg" onClick={onWrong}>
            Wrong
          </button>
        </>
      )}
      {mode === "reveal" && (
        <button type="button" className="btn-chunky bg-cyan text-lg" onClick={onNext}>
          Next now
        </button>
      )}
      {mode === "open" && (
        <span className="animate-pulse rounded-xl border-2 border-ink bg-acid px-4 py-2.5 font-display text-lg text-ink shadow-[3px_3px_0_#07040a]">
          Listening for buzz…
        </span>
      )}
    </div>
  );
}
