"use client";

import { useEffect, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { SoundPartyState } from "@shared/types";
import { getPack } from "@shared/packs";
import { BuzzButton, HostJudgeBar } from "@/components/buzzer/BuzzControls";
import { motionBus, pulse, useGsapReady } from "@/lib/motion";

export function SoundPartyHost({ room, onAction }: GameViewProps) {
  const state = room.gameState as SoundPartyState;
  const pack = getPack(room.packId);
  const track = pack.games["sound-party"].tracks.find(
    (t) => t.id === state.clueIds[state.clueIndex],
  );
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const audioRef = useRef<HTMLAudioElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  useEffect(() => {
    motionBus.emit("scene", { cue: "vinyl-spin" });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (state.mode === "open" || state.audioPlaying) {
      audio.currentTime = 0;
      void audio.play().catch(() => undefined);
      if (ready) pulse(discRef.current);
    } else {
      audio.pause();
    }
  }, [state.mode, state.clueIndex, state.audioPlaying, track, ready]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <p className="font-display text-sm uppercase tracking-widest text-coral">Sound Party</p>
      <div
        ref={discRef}
        className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-ink bg-gradient-to-br from-ink to-coral shadow-[0_0_0_8px_#ffc700,8px_8px_0_#00f0ff] md:h-64 md:w-64"
      >
        <div className="h-16 w-16 rounded-full bg-acid border-4 border-ink" />
        <div className="absolute inset-6 rounded-full border border-cream/20" />
      </div>
      <audio ref={audioRef} src={track?.audioUrl} preload="auto" />
      <p className="text-cream/70">
        Clue {state.clueIndex + 1}/{state.clueIds.length}
      </p>
      {state.mode === "reveal" && state.lastResult === "correct" && (
        <div className="text-center">
          <p className="font-display text-4xl text-acid">{track?.title}</p>
          {track?.movie && <p className="text-cream/70">{track.movie}</p>}
        </div>
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

export function SoundPartyPlayer({ room, playerId, onAction }: GameViewProps) {
  const state = room.gameState as SoundPartyState;
  const [answer, setAnswer] = useState("");
  const me = room.players.find((p) => p.id === playerId);
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const isLockedByMe = state.lockedBy === playerId;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="font-display text-xl text-cream">Sound Party</p>
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
      <BuzzButton
        disabled={state.mode !== "open"}
        onBuzz={() => onAction({ type: "buzz", playerId: playerId! })}
      />
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
            placeholder="Song name…"
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
