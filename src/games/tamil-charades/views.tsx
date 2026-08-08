"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { CharadesState } from "@shared/types";
import { getPack } from "@shared/packs";
import {
  clueSoftIn,
  motionBus,
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
  const timerRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLParagraphElement>(null);
  const prevRemaining = useRef<number | null>(null);

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
    if (!ready || state.mode !== "reveal") return;
    stampIn(answerRef.current);
  }, [ready, state.mode, state.clueIndex]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <p className="font-display text-sm uppercase tracking-widest text-acid">Cinema Charades</p>
      <h2 className="font-display text-4xl text-cream md:text-6xl">
        Team {state.actingTeam?.toUpperCase()} is up
      </h2>
      <p className="text-cream/70">
        Actor phone:{" "}
        <strong className="text-cream">
          {teamBuzzer?.name ?? "Waiting for team buzzer…"}
        </strong>
      </p>
      {state.mode === "acting" && (
        <div
          ref={timerRef}
          className="charades-timer font-display text-7xl text-coral md:text-9xl"
        >
          {remaining ?? "—"}
        </div>
      )}
      <p className="max-w-md text-cream/60">
        Title stays off the TV. Only that team’s buzzer phone shows the movie.
      </p>
      {state.mode === "reveal" && (
        <p ref={answerRef} className="font-display text-4xl text-acid">
          {movie?.title}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        {state.mode === "idle" && (
          <button
            type="button"
            className="btn-chunky bg-coral"
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
              className="btn-chunky bg-acid"
              onClick={() => onAction({ type: "charadesCorrect" })}
            >
              Got it!
            </button>
            <button
              type="button"
              className="btn-chunky bg-coral"
              onClick={() => onAction({ type: "charadesSkip" })}
            >
              Skip
            </button>
          </>
        )}
        {state.mode === "reveal" && (
          <button
            type="button"
            className="btn-chunky bg-cyan"
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
    <div className="flex h-full flex-col items-center justify-center gap-4 p-2 text-center">
      <p className="font-display text-xl text-cream">Cinema Charades</p>
      {showSecret ? (
        <div
          ref={secretRef}
          className="w-full max-w-sm rounded-[2rem] border-8 border-ink bg-acid px-6 py-10 shadow-[8px_8px_0_#ff3d6e]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <p className="text-xs uppercase tracking-widest text-ink/70">Act this out</p>
          <p className="mt-3 font-display text-3xl text-ink md:text-4xl">{secret}</p>
          <p className="mt-4 text-sm text-ink/70">Keep this screen private!</p>
        </div>
      ) : (
        <div className="rounded-3xl border-4 border-dashed border-cream/30 px-6 py-12">
          <p className="font-display text-2xl text-cream/80">
            {me?.team === state.actingTeam
              ? "Get ready to act…"
              : "Watch & shout guesses"}
          </p>
          <p className="mt-2 text-cream/50">
            {state.mode === "acting"
              ? `Team ${state.actingTeam?.toUpperCase()} is acting`
              : "Waiting for the next round"}
          </p>
        </div>
      )}
    </div>
  );
}
