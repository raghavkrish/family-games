"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { CharadesState } from "@shared/types";
import { getPack } from "@shared/packs";
import {
  clueSoftIn,
  confettiBurst,
  gsap,
  motionBus,
  prefersReducedMotion,
  stampIn,
  timerNudge,
  useGsapReady,
} from "@/lib/motion";

export function CharadesHost({ room, onAction }: GameViewProps) {
  const state = room.gameState as CharadesState;
  const pack = getPack(room.packId);
  const movie = pack.games["tamil-charades"].movies.find(
    (m) => m.id === state.clueIds[state.clueIndex],
  );
  const teamBuzzer = room.players.find(
    (p) => p.team === state.actingTeam && !p.isHost && p.connected,
  );
  const ready = useGsapReady();
  const [remaining, setRemaining] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);
  const prevRemaining = useRef<number | null>(null);
  const urgent = remaining != null && remaining <= 10;

  useEffect(() => {
    motionBus.emit("scene", { cue: "reel-spin" });
  }, []);

  useEffect(() => {
    if (state.mode !== "acting" || !state.endsAt) {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(Math.max(0, Math.ceil((state.endsAt! - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 250);
    return () => clearInterval(id);
  }, [state.mode, state.endsAt]);

  useEffect(() => {
    if (!ready || state.mode !== "acting") return;
    clueSoftIn(timerRef.current);
  }, [ready, state.clueIndex, state.mode]);

  useEffect(() => {
    if (remaining == null) {
      prevRemaining.current = null;
      return;
    }
    if (
      remaining <= 10 &&
      prevRemaining.current !== null &&
      remaining < prevRemaining.current
    ) {
      timerNudge(timerRef.current);
    }
    prevRemaining.current = remaining;
  }, [remaining]);

  useEffect(() => {
    if (!ready || !timerRef.current || state.mode !== "acting" || !urgent) return;
    if (prefersReducedMotion()) return;
    const tween = gsap.to(timerRef.current, {
      textShadow: "0 0 28px rgba(255,42,31,0.85)",
      duration: 0.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
      if (timerRef.current) gsap.set(timerRef.current, { clearProps: "textShadow" });
    };
  }, [ready, state.mode, urgent]);

  useEffect(() => {
    if (!ready || state.mode !== "reveal") return;
    stampIn(answerRef.current);
    confettiBurst(boardRef.current, 28);
  }, [ready, state.mode, state.clueIndex]);

  return (
    <div
      ref={boardRef}
      className="relative flex h-full flex-col items-center justify-center gap-6 text-center"
    >
      <p className="font-display text-sm uppercase tracking-widest text-acid">Cinema Charades</p>
      <h2 className="font-display text-5xl text-cream md:text-7xl">
        Team {state.actingTeam?.toUpperCase()} is up
      </h2>
      <p className="text-lg text-cream/75">
        Actor phone:{" "}
        <strong className="text-cream">
          {teamBuzzer?.name ?? "Waiting for team buzzer…"}
        </strong>
      </p>
      {state.mode === "acting" && (
        <div
          ref={timerRef}
          className={`charades-timer font-display text-8xl md:text-[9rem] ${
            urgent ? "text-acid" : "text-coral"
          }`}
        >
          {remaining ?? "—"}
        </div>
      )}
      <p className="max-w-md text-cream/60">
        Title stays off the TV. Only that team’s buzzer phone shows the movie.
      </p>
      {state.mode === "reveal" && (
        <p ref={answerRef} className="font-display text-5xl text-acid md:text-6xl">
          {movie?.title}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {state.mode === "idle" && (
          <button
            type="button"
            className="btn-chunky bg-coral text-lg"
            onClick={() => onAction({ type: "startRound" })}
            disabled={!teamBuzzer}
          >
            Start acting
          </button>
        )}
        {state.mode === "acting" && (
          <>
            <button
              type="button"
              className="btn-chunky bg-acid text-lg"
              onClick={() => onAction({ type: "charadesCorrect" })}
            >
              Got it!
            </button>
            <button
              type="button"
              className="btn-chunky bg-coral text-lg"
              onClick={() => onAction({ type: "charadesSkip" })}
            >
              Skip
            </button>
          </>
        )}
        {state.mode === "reveal" && (
          <button
            type="button"
            className="btn-chunky bg-cyan text-lg"
            onClick={() => onAction({ type: "nextRound" })}
          >
            Next movie
          </button>
        )}
      </div>
      <p className="text-sm text-cream/50">
        {state.clueIndex + 1}/{state.clueIds.length}
      </p>
    </div>
  );
}

export function CharadesPlayer({ room, playerId }: GameViewProps) {
  const state = room.gameState as CharadesState;
  const pack = getPack(room.packId);
  const movie = pack.games["tamil-charades"].movies.find(
    (m) => m.id === state.clueIds[state.clueIndex],
  );
  const me = room.players.find((p) => p.id === playerId);
  const showSecret =
    state.mode === "acting" &&
    (state.actorId === playerId ||
      (me?.team === state.actingTeam && Boolean(me?.connected)));
  const secret = useMemo(
    () => (showSecret ? movie?.title : null),
    [showSecret, movie],
  );
  const secretRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    if (!ready || !showSecret) return;
    stampIn(secretRef.current);
  }, [ready, showSecret, secret]);

  return (
    <div
      className={`relative flex h-full min-h-0 flex-col items-center justify-center gap-4 -m-4 rounded-[1.5rem] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center md:-m-6 md:p-6 ${
        me?.team === "a" ? "team-mood-a" : me?.team === "b" ? "team-mood-b" : ""
      }`}
    >
      <p className="font-display text-xs uppercase tracking-[0.2em] text-cream/60">
        Cinema Charades
      </p>
      {showSecret ? (
        <div
          ref={secretRef}
          className="w-full max-w-sm rounded-[2rem] border-[10px] border-ink bg-acid px-6 py-12 shadow-[10px_10px_0_#ff2a1f]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <p className="text-xs uppercase tracking-widest text-ink/70">Act this out</p>
          <p className="mt-3 font-display text-4xl text-ink md:text-5xl">{secret}</p>
          <p className="mt-4 text-sm text-ink/70">Keep this screen private!</p>
        </div>
      ) : (
        <div className="rounded-3xl border-4 border-dashed border-cream/35 bg-ink/20 px-6 py-12">
          <p className="font-display text-3xl text-cream">
            {me?.team === state.actingTeam
              ? "Get ready to act…"
              : "Watch & shout guesses"}
          </p>
          <p className="mt-2 text-cream/60">
            {state.mode === "acting"
              ? `Team ${state.actingTeam?.toUpperCase()} is acting`
              : "Waiting for the next round"}
          </p>
        </div>
      )}
    </div>
  );
}
