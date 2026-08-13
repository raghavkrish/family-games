"use client";

import { useEffect, useRef, useState } from "react";
import type { GameViewProps } from "@/games";
import type { SoundPartyState } from "@shared/types";
import { getPack } from "@shared/packs";
import { AnswerForm, BuzzButton, HostJudgeBar, PhoneBuzzerStage } from "@/components/buzzer/BuzzControls";
import { HostBuzzTakeover } from "@/components/buzzer/HostBuzzTakeover";
import {
  confettiBurst,
  discGroove,
  gsap,
  motionBus,
  prefersReducedMotion,
  stampIn,
  wrongPunch,
  useGsapReady,
} from "@/lib/motion";

export function SoundPartyHost({ room, onAction }: GameViewProps) {
  const state = room.gameState as SoundPartyState;
  const pack = getPack(room.packId);
  const track = pack.games["sound-party"].tracks.find(
    (t) => t.id === state.clueIds[state.clueIndex],
  );
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const audioRef = useRef<HTMLAudioElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const listenRef = useRef<HTMLParagraphElement>(null);
  const ready = useGsapReady();
  const grooveRef = useRef<ReturnType<typeof discGroove>>(null);
  const [playing, setPlaying] = useState(false);

  const stopGroove = () => {
    grooveRef.current?.kill();
    grooveRef.current = null;
  };

  const startGroove = () => {
    if (!ready) return;
    stopGroove();
    grooveRef.current = discGroove(discRef.current);
  };

  const pauseClip = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
    stopGroove();
  };

  const playClip = (fromStart = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fromStart) audio.currentTime = 0;
    void audio
      .play()
      .then(() => {
        setPlaying(true);
        startGroove();
      })
      .catch(() => {
        setPlaying(false);
        stopGroove();
      });
  };

  useEffect(() => {
    motionBus.emit("scene", { cue: "vinyl-spin" });
  }, []);

  // Don't auto-play — host starts each clip. Stop when leaving open.
  useEffect(() => {
    if (!track) return;
    if (state.mode !== "open") {
      pauseClip();
    } else {
      // Fresh clue: reset to start, stay paused until host hits Play.
      const audio = audioRef.current;
      if (audio) audio.currentTime = 0;
      setPlaying(false);
      stopGroove();
    }
    return () => {
      stopGroove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional on mode/clue/track
  }, [state.mode, state.clueIndex, track?.audioUrl, ready]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      setPlaying(false);
      stopGroove();
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [track?.audioUrl]);

  useEffect(() => {
    if (!ready || state.mode !== "reveal" || !state.lastResult) return;
    if (state.lastResult === "correct") {
      stampIn(answerRef.current);
      confettiBurst(boardRef.current, 32);
    } else {
      wrongPunch(answerRef.current);
    }
  }, [ready, state.mode, state.lastResult, state.clueIndex]);

  useEffect(() => {
    if (!ready || !listenRef.current || state.mode !== "open") return;
    if (prefersReducedMotion()) return;
    const tween = gsap.to(listenRef.current, {
      opacity: 0.55,
      duration: 0.55,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => {
      tween.kill();
      if (listenRef.current) gsap.set(listenRef.current, { opacity: 1 });
    };
  }, [ready, state.mode, state.clueIndex]);

  const revealPrefix =
    state.lastResult === "wrong"
      ? "Wrong — "
      : state.lastResult === "pass"
        ? "Pass — "
        : "";

  const canControlAudio = state.mode === "open";

  return (
    <div
      ref={boardRef}
      className="relative flex h-full flex-col items-center justify-center gap-6"
    >
      {state.mode === "locked" && <HostBuzzTakeover lockedPlayer={locked} />}
      <p className="font-display text-sm uppercase tracking-widest text-coral">
        Sound Party
      </p>
      <div
        ref={discRef}
        className="relative flex h-52 w-52 items-center justify-center rounded-full border-[10px] border-ink bg-gradient-to-br from-ink via-coral to-acid shadow-[0_0_0_10px_#ffe566,10px_10px_0_#00f5d4,0_0_50px_rgba(255,229,102,0.35)] md:h-72 md:w-72"
      >
        <div className="h-20 w-20 rounded-full border-4 border-ink bg-acid shadow-[inset_0_0_20px_rgba(0,0,0,0.35)]" />
        <div className="absolute inset-7 rounded-full border-2 border-cream/25" />
        <div className="absolute inset-12 rounded-full border border-cream/15" />
      </div>
      <audio ref={audioRef} src={track?.audioUrl} preload="auto" />
      <p ref={listenRef} className="font-display text-lg text-cream/80">
        {state.mode === "open"
          ? playing
            ? "♪ Playing…"
            : "Ready — host, hit Play"
          : `Clue ${state.clueIndex + 1}/${state.clueIds.length}`}
      </p>
      {canControlAudio && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {playing ? (
            <button
              type="button"
              className="btn-chunky bg-coral px-6 text-lg"
              onClick={pauseClip}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn-chunky bg-acid px-6 text-lg"
              onClick={() => playClip(false)}
            >
              Play
            </button>
          )}
          <button
            type="button"
            className="btn-chunky bg-cyan px-6 text-lg"
            onClick={() => playClip(true)}
          >
            Replay
          </button>
        </div>
      )}
      {state.mode === "reveal" && (
        <div ref={answerRef} className="text-center">
          <p
            className={`font-display text-5xl md:text-6xl ${
              state.lastResult === "correct" ? "text-acid" : "text-coral"
            }`}
          >
            {revealPrefix}
            {track?.title}
          </p>
          {track?.movie && <p className="mt-1 text-lg text-cream/70">{track.movie}</p>}
        </div>
      )}
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
  );
}

export function SoundPartyPlayer({ room, playerId, onAction }: GameViewProps) {
  const state = room.gameState as SoundPartyState;
  const [answer, setAnswer] = useState("");
  const me = room.players.find((p) => p.id === playerId);
  const locked = room.players.find((p) => p.id === state.lockedBy);
  const isLockedByMe = state.lockedBy === playerId;

  const status =
    state.mode === "open"
      ? "TAP TO BUZZ — name that tune"
      : state.mode === "locked" && isLockedByMe
        ? "You’re in — type the song"
        : state.mode === "locked"
          ? `${locked?.name ?? "Other team"} buzzed — wait`
          : state.mode === "reveal"
            ? "Watch the TV"
            : "Wait for the next track";

  return (
    <PhoneBuzzerStage team={me?.team ?? null} title="Sound Party" status={status}>
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
