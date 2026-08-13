"use client";

import { useEffect, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { TentKottaiGameId, TentKottaiState } from "@shared/types";
import { getPack, tentSection } from "@shared/packs";

function tentLabel(gameId: TentKottaiGameId) {
  return gameId === "tent-kottai-movies"
    ? "Tent Kottai · Movies"
    : "Tent Kottai · Songs";
}
import { AnswerForm, BuzzButton, HostJudgeBar, PhoneBuzzerStage } from "@/components/buzzer/BuzzControls";
import { HostBuzzTakeover } from "@/components/buzzer/HostBuzzTakeover";
import { motionBus, clueSoftIn, stampIn, confettiBurst, wrongPunch, gsap, prefersReducedMotion, useGsapReady } from "@/lib/motion";

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
  const puzzles = tentSection(pack, state.gameId).puzzles;
  const puzzle = puzzles.find((p) => p.id === state.clueIds[state.clueIndex]);
  const tiles = puzzleTiles(puzzle);
  const revealedCount = state.revealedCount ?? 0;
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const boardRef = useRef<HTMLDivElement>(null);
  const prevRevealed = useRef(revealedCount);
  const ready = useGsapReady();
  const [enlargedSrc, setEnlargedSrc] = useState<string | null>(null);

  useEffect(() => {
    motionBus.emit("scene", { cue: "tent-pop" });
  }, []);

  useEffect(() => {
    setEnlargedSrc(null);
  }, [state.clueIndex]);

  useEffect(() => {
    if (!enlargedSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnlargedSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enlargedSrc]);

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
    if (!ready || state.mode !== "reveal" || !state.lastResult) return;
    const answer = boardRef.current?.querySelector(".answer-reveal") as HTMLElement | null;
    if (state.lastResult === "correct") {
      stampIn(answer);
      confettiBurst(boardRef.current, 36);
    } else {
      wrongPunch(answer);
    }
  }, [ready, state.mode, state.lastResult, state.clueIndex]);

  const canRevealMore = revealedCount < tiles.length;

  const pressReveal = (btn: HTMLButtonElement | null) => {
    if (!btn || prefersReducedMotion()) return;
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.92, yoyo: true, repeat: 1, duration: 0.08 });
  };

  const cols = tiles.length <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(tiles.length / cols));
  const gapPx = 12;

  return (
    <div ref={boardRef} className="relative flex h-full min-h-0 flex-col gap-2 md:gap-3">
      {state.mode === "locked" && <HostBuzzTakeover lockedPlayer={locked} />}
      <div className="flex shrink-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xs uppercase tracking-widest text-cyan md:text-sm">
            {tentLabel(state.gameId)}
          </p>
          <h2 className="clue-title truncate font-display text-2xl text-cream md:text-4xl lg:text-5xl">
            {puzzle?.category ?? "Connexion"}
          </h2>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-xs md:text-sm">
          <p className="rounded-full border-2 border-cream/30 px-3 py-1">
            Puzzle {state.clueIndex + 1}/{state.clueIds.length}
          </p>
          <p className="rounded-full border-2 border-cyan/40 px-3 py-1 text-cyan">
            Clues {revealedCount}/{tiles.length}
          </p>
        </div>
      </div>
      <div
        className="relative min-h-0 w-full flex-1"
        style={{ containerType: "size" }}
      >
        <div
          className="absolute left-1/2 top-1/2 grid"
          style={{
            gap: gapPx,
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
            width: `min(100cqw, calc((100cqh - ${(rows - 1) * gapPx}px) * ${cols} / ${rows} + ${(cols - 1) * gapPx}px))`,
            height: `min(100cqh, calc((100cqw - ${(cols - 1) * gapPx}px) * ${rows} / ${cols} + ${(rows - 1) * gapPx}px))`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {tiles.map((item, i) => {
            const shown = i < revealedCount;
            const isImage = isImageTile(item);
            return (
              <div
                key={`${state.clueIndex}-${i}`}
                data-tile-index={i}
                className="clue-tile relative min-h-0 overflow-hidden rounded-2xl border-4 border-ink shadow-[4px_4px_0_#00f5d4] md:rounded-3xl md:shadow-[6px_6px_0_#00f5d4]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {shown ? (
                  isImage ? (
                    <button
                      type="button"
                      className="tile-face absolute inset-0 flex cursor-zoom-in items-center justify-center bg-ink"
                      aria-label="Enlarge clue"
                      onClick={() => setEnlargedSrc(item)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item}
                        alt=""
                        className="pointer-events-none h-full w-full object-contain"
                      />
                    </button>
                  ) : (
                    <div className="tile-face absolute inset-0 flex items-center justify-center bg-cream text-4xl md:text-6xl lg:text-7xl">
                      {item}
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stage">
                    <span className="font-display text-3xl text-cream/25 md:text-5xl lg:text-6xl">
                      ?
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest text-cream/30 md:text-xs">
                      Hidden
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {state.mode === "reveal" && (
        <p
          className={`answer-reveal shrink-0 text-center font-display text-2xl md:text-4xl ${
            state.lastResult === "correct" ? "text-acid" : "text-coral"
          }`}
        >
          {state.lastResult === "wrong"
            ? "Wrong — "
            : state.lastResult === "pass"
              ? "Pass — "
              : ""}
          {puzzle?.answer}
        </p>
      )}
      <div className="relative z-50 flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-chunky bg-cyan"
          disabled={!canRevealMore || state.mode === "reveal"}
          onClick={(e) => {
            pressReveal(e.currentTarget);
            onAction({ type: "revealNext" });
          }}
        >
          Reveal next
        </button>
        <HostJudgeBar
          mode={state.mode}
          lastResult={state.lastResult}
          lockedByName={locked?.name}
          lockedTeam={locked?.team ?? null}
          submittedAnswer={state.submittedAnswer}
          onCorrect={() => onAction({ type: "judge", correct: true })}
          onWrong={() => onAction({ type: "judge", correct: false })}
          onPass={() => onAction({ type: "pass" })}
          onNext={() => onAction({ type: "nextRound" })}
        />
      </div>

      {enlargedSrc && (
        <div
          className="absolute inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged clue"
          onClick={() => setEnlargedSrc(null)}
        >
          <div
            className="relative flex max-h-[90%] max-w-[90%] flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-3xl border-[5px] border-ink bg-paper shadow-[10px_10px_0_#ff2a1f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={enlargedSrc}
                alt=""
                className="max-h-[min(78vh,720px)] max-w-[min(90vw,900px)] object-contain"
              />
            </div>
            <button
              type="button"
              className="btn-chunky bg-acid px-6 py-3 text-lg"
              onClick={() => setEnlargedSrc(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TentKottaiPlayer({ room, playerId, onAction }: GameViewProps) {
  const state = room.gameState as TentKottaiState;
  const [answer, setAnswer] = useState("");
  const me = room.players.find((p) => p.id === playerId);
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const isLockedByMe = state.lockedBy === playerId;

  const status =
    state.mode === "open"
      ? "TAP TO BUZZ"
      : state.mode === "locked" && isLockedByMe
        ? "You’re in — type your guess"
        : state.mode === "locked"
          ? `${locked?.name ?? "Other team"} buzzed — wait`
          : state.mode === "reveal"
            ? "Watch the TV"
            : `Clues on TV: ${state.revealedCount ?? 0} · wait for host`;

  return (
    <PhoneBuzzerStage
      team={me?.team ?? null}
      title={tentLabel(state.gameId)}
      status={status}
    >
      <BuzzButton
        phase={state.mode}
        lockedByMe={isLockedByMe}
        onBuzz={() => onAction({ type: "buzz", playerId: playerId! })}
      />
      {isLockedByMe && (
        <AnswerForm
          value={answer}
          onChange={setAnswer}
          onSubmit={() => {
            onAction({ type: "submitAnswer", playerId: playerId!, answer });
            setAnswer("");
          }}
        />
      )}
    </PhoneBuzzerStage>
  );
}
