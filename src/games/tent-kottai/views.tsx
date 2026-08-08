"use client";

import { useEffect, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { TentKottaiState } from "@shared/types";
import { getPack } from "@shared/packs";
import { BuzzButton, HostJudgeBar } from "@/components/buzzer/BuzzControls";
import { motionBus, slamIn, staggerPop, useGsapReady } from "@/lib/motion";

export function TentKottaiHost({ room, onAction }: GameViewProps) {
  const state = room.gameState as TentKottaiState;
  const pack = getPack(room.packId);
  const puzzle = pack.games["tent-kottai"].puzzles.find(
    (p) => p.id === state.clueIds[state.clueIndex],
  );
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const boardRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    motionBus.emit("scene", { cue: "tent-pop" });
  }, []);

  useEffect(() => {
    if (!ready || !boardRef.current) return;
    slamIn(boardRef.current.querySelector(".clue-title"));
    staggerPop(boardRef.current.querySelectorAll(".clue-tile"));
  }, [ready, state.clueIndex, state.mode]);

  return (
    <div ref={boardRef} className="flex h-full flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm uppercase tracking-widest text-cyan">Tent Kottai</p>
          <h2 className="clue-title font-display text-4xl text-cream md:text-6xl">
            {puzzle?.category ?? "Connexion"}
          </h2>
        </div>
        <p className="rounded-full border-2 border-cream/30 px-3 py-1 text-sm">
          {state.clueIndex + 1}/{state.clueIds.length}
        </p>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3 md:gap-4">
        {(puzzle?.emojiClues?.length
          ? puzzle.emojiClues
          : puzzle?.imageUrls?.length
            ? puzzle.imageUrls
            : ["❓", "🔗"]
        ).map((item, i) => (
          <div
            key={`${state.clueIndex}-${i}`}
            className="clue-tile flex items-center justify-center rounded-3xl border-4 border-ink bg-cream text-6xl shadow-[6px_6px_0_#00f0ff] md:text-8xl"
            style={{ transformStyle: "preserve-3d" }}
          >
            {item.startsWith("http") || item.startsWith("/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item} alt="" className="h-full w-full rounded-[1.3rem] object-cover" />
            ) : (
              item
            )}
          </div>
        ))}
      </div>
      {state.mode === "reveal" && state.lastResult === "correct" && (
        <p className="text-center font-display text-3xl text-acid">{puzzle?.answer}</p>
      )}
      <HostJudgeBar
        mode={state.mode}
        lockedByName={locked?.name}
        submittedAnswer={state.submittedAnswer}
        onStart={() => onAction({ type: "startRound" })}
        onCorrect={() => onAction({ type: "judge", correct: true })}
        onWrong={() => onAction({ type: "judge", correct: false })}
        onNext={() => onAction({ type: "nextRound" })}
      />
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
