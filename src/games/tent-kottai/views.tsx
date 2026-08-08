"use client";

import { useEffect, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { TentKottaiState } from "@shared/types";
import { getPack } from "@shared/packs";
import { BuzzButton, HostJudgeBar } from "@/components/buzzer/BuzzControls";
import { HostBuzzTakeover } from "@/components/buzzer/HostBuzzTakeover";
import { motionBus, clueSoftIn, stampIn, gsap, prefersReducedMotion, useGsapReady } from "@/lib/motion";

function puzzleTiles(puzzle: {
  emojiClues?: string[];
  imageUrls?: string[];
} | undefined): string[] {
  if (!puzzle) return ["❓", "🔗"];
  if (puzzle.imageUrls?.length) return puzzle.imageUrls;
  if (puzzle.emojiClues?.length) return puzzle.emojiClues;
  return ["❓", "🔗"];
}

function isImageTile(item: string) {
  return (
    item.startsWith("http") ||
    item.startsWith("/") ||
    /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(item)
  );
}

export function TentKottaiHost({ room, onAction }: GameViewProps) {
  const state = room.gameState as TentKottaiState;
  const pack = getPack(room.packId);
  const puzzle = pack.games["tent-kottai"].puzzles.find(
    (p) => p.id === state.clueIds[state.clueIndex],
  );
  const tiles = puzzleTiles(puzzle);
  const revealedCount = state.revealedCount ?? 0;
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const boardRef = useRef<HTMLDivElement>(null);
  const prevRevealed = useRef(revealedCount);
  const ready = useGsapReady();

  useEffect(() => {
    motionBus.emit("scene", { cue: "tent-pop" });
  }, []);

  useEffect(() => {
    if (!ready || !boardRef.current) return;
    clueSoftIn(boardRef.current.querySelector(".clue-title"));
  }, [ready, state.clueIndex]);

  useEffect(() => {
    if (!ready || !boardRef.current) return;
    if (revealedCount > prevRevealed.current) {
      const tile = boardRef.current.querySelector(
        `[data-tile-index="${revealedCount - 1}"] .tile-face`,
      );
      clueSoftIn(tile);
    }
    prevRevealed.current = revealedCount;
  }, [ready, revealedCount]);

  useEffect(() => {
    prevRevealed.current = 0;
  }, [state.clueIndex]);

  useEffect(() => {
    if (!ready || state.mode !== "reveal" || state.lastResult !== "correct") return;
    const answer = boardRef.current?.querySelector(".answer-reveal") as HTMLElement | null;
    stampIn(answer);
  }, [ready, state.mode, state.lastResult, state.clueIndex]);

  const canRevealMore = revealedCount < tiles.length;

  const pressReveal = (btn: HTMLButtonElement | null) => {
    if (!btn || prefersReducedMotion()) return;
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.92, yoyo: true, repeat: 1, duration: 0.08 });
  };

  return (
    <div ref={boardRef} className="relative flex h-full flex-col gap-4">
      {state.mode === "locked" && <HostBuzzTakeover lockedPlayer={locked} />}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-cyan">Tent Kottai</p>
          <h2 className="clue-title font-display text-4xl text-cream md:text-6xl">
            {puzzle?.category ?? "Connexion"}
          </h2>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
          <p className="rounded-full border-2 border-cream/30 px-3 py-1">
            Puzzle {state.clueIndex + 1}/{state.clueIds.length}
          </p>
          <p className="rounded-full border-2 border-cyan/40 px-3 py-1 text-cyan">
            Clues {revealedCount}/{tiles.length}
          </p>
        </div>
      </div>
      <div
        className={`grid flex-1 gap-3 md:gap-4 ${
          tiles.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {tiles.map((item, i) => {
          const shown = i < revealedCount;
          return (
            <div
              key={`${state.clueIndex}-${i}`}
              data-tile-index={i}
              className="clue-tile relative flex items-center justify-center overflow-hidden rounded-3xl border-4 border-ink shadow-[6px_6px_0_#00f0ff]"
              style={{ transformStyle: "preserve-3d" }}
            >
              {shown ? (
                <div
                  className={`tile-face flex h-full min-h-[7rem] w-full items-center justify-center md:min-h-[10rem] ${
                    isImageTile(item)
                      ? "bg-ink"
                      : "bg-cream text-6xl md:text-8xl"
                  }`}
                >
                  {isImageTile(item) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item}
                      alt=""
                      className="h-full w-full rounded-[1.3rem] object-cover"
                    />
                  ) : (
                    item
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[7rem] w-full flex-col items-center justify-center bg-stage md:min-h-[10rem]">
                  <span className="font-display text-4xl text-cream/25 md:text-6xl">?</span>
                  <span className="mt-1 text-xs uppercase tracking-widest text-cream/30">
                    Hidden
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {state.mode === "reveal" && state.lastResult === "correct" && (
        <p className="answer-reveal text-center font-display text-3xl text-acid">
          {puzzle?.answer}
        </p>
      )}
      <div className="relative z-50 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-chunky bg-cyan"
          disabled={!canRevealMore}
          onClick={(e) => {
            pressReveal(e.currentTarget);
            onAction({ type: "revealNext" });
          }}
        >
          Reveal next
        </button>
        <HostJudgeBar
          mode={state.mode}
          lockedByName={locked?.name}
          lockedTeam={locked?.team ?? null}
          submittedAnswer={state.submittedAnswer}
          onCorrect={() => onAction({ type: "judge", correct: true })}
          onWrong={() => onAction({ type: "judge", correct: false })}
          onNext={() => onAction({ type: "nextRound" })}
        />
      </div>
    </div>
  );
}

export function TentKottaiPlayer({ room, playerId, onAction }: GameViewProps) {
  const state = room.gameState as TentKottaiState;
  const [answer, setAnswer] = useState("");
  const me = room.players.find((p) => p.id === playerId);
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const isLockedByMe = state.lockedBy === playerId;
  const canBuzz = state.mode === "open";

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="font-display text-xl text-cream">Tent Kottai</p>
      <p
        className={`rounded-full border-2 border-ink px-3 py-1 font-display text-sm text-ink ${
          me?.team === "a" ? "bg-coral" : "bg-cyan"
        }`}
      >
        {me?.name ?? "Team"} Buzzer
      </p>
      <p className="text-sm text-cream/50">
        Clues on TV: {state.revealedCount ?? 0}
      </p>
      {state.mode === "locked" && !isLockedByMe && (
        <p className="text-cream/70">
          {locked?.name ?? "Other team"} buzzed — wait up
        </p>
      )}
      <BuzzButton disabled={!canBuzz} onBuzz={() => onAction({ type: "buzz", playerId: playerId! })} />
      {isLockedByMe && (
        <form
          className="flex w-full max-w-sm gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onAction({ type: "submitAnswer", playerId: playerId!, answer });
            setAnswer("");
          }}
        >
          <input
            className="input-chunky flex-1"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Team guess…"
            autoFocus
          />
          <button type="submit" className="btn-chunky bg-acid">
            Send
          </button>
        </form>
      )}
    </div>
  );
}
