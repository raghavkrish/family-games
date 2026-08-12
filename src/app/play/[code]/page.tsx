"use client";

import { Suspense, use, useEffect, useMemo, useRef, useState } from "react";
import { PartyShell } from "@/components/shell/PartyShell";
import { useRoom } from "@/lib/room/client";
import { getGame } from "@/games";
import { teamPickerEnter, takeoverPulse, useGsapReady } from "@/lib/motion";

function PlayInner({ roomCode }: { roomCode: string }) {
  const roomApi = useRoom(roomCode, "player");
  const {
    state,
    you,
    connected,
    gameAction,
    joinTeam,
    lastError,
    clearError,
    partyUrl,
  } = roomApi;
  const [pendingTeam, setPendingTeam] = useState<"a" | "b" | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const takeoverRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();

  const active = state?.activeGameId ? getGame(state.activeGameId) : null;
  const me = state?.players.find((p) => p.id === you?.playerId);

  useEffect(() => {
    if (!ready || !pickerRef.current || me?.team) return;
    teamPickerEnter(pickerRef.current);
  }, [ready, me?.team, connected]);

  useEffect(() => {
    if (lastError?.code === "team-taken" && lastError.payload?.team) {
      setPendingTeam(lastError.payload.team as "a" | "b");
    }
  }, [lastError]);

  useEffect(() => {
    if (pendingTeam && takeoverRef.current) {
      takeoverPulse(takeoverRef.current);
    }
  }, [pendingTeam]);

  const stage = useMemo(() => {
    if (!state || !connected) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="font-display text-2xl text-cream/70">Connecting…</p>
          {partyUrl && (
            <p className="text-xs text-cream/40">Party: {partyUrl}</p>
          )}
          {lastError && (
            <p className="max-w-sm text-sm text-coral">{lastError.message}</p>
          )}
          {!connected && !lastError && (
            <p className="max-w-sm text-sm text-cream/50">
              On your phone, open the site using your computer’s Wi‑Fi address (e.g.
              192.168.x.x:3000), not localhost.
            </p>
          )}
        </div>
      );
    }

    if (!me?.team) {
      return (
        <div
          ref={pickerRef}
          className="flex h-full flex-col items-center justify-center gap-6 px-1 text-center"
        >
          <h2 className="pick-title font-display text-5xl text-cream md:text-6xl">
            Pick your team
          </h2>
          <p className="max-w-xs text-lg text-cream/80">
            This phone becomes that team’s buzzer for the night.
          </p>
          <div className="grid w-full max-w-sm gap-4">
            <button
              type="button"
              className="team-a btn-chunky bg-coral py-10 text-4xl"
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => {
                clearError();
                joinTeam("a");
              }}
            >
              Team A
            </button>
            <button
              type="button"
              className="team-b btn-chunky bg-cyan py-10 text-4xl"
              style={{ transformStyle: "preserve-3d" }}
              onClick={() => {
                clearError();
                joinTeam("b");
              }}
            >
              Team B
            </button>
          </div>
          {lastError?.code === "team-taken" && pendingTeam && (
            <div
              ref={takeoverRef}
              className="mt-2 w-full max-w-sm rounded-2xl border-4 border-ink bg-acid p-4 text-ink shadow-[4px_4px_0_#07040a]"
            >
              <p className="font-display text-lg">
                Team {pendingTeam.toUpperCase()} already has a buzzer
              </p>
              <button
                type="button"
                className="btn-chunky mt-3 w-full bg-coral py-3"
                onClick={() => {
                  joinTeam(pendingTeam, true);
                  clearError();
                  setPendingTeam(null);
                }}
              >
                Take over
              </button>
            </div>
          )}
          {lastError && lastError.code !== "team-taken" && (
            <p className="text-coral">{lastError.message}</p>
          )}
        </div>
      );
    }

    if (state.phase === "lobby" || state.phase === "pickGame") {
      return (
        <div
          className={`flex h-full flex-col items-center justify-center gap-4 -m-4 rounded-[1.5rem] p-6 text-center md:-m-6 ${
            me.team === "a" ? "team-mood-a" : "team-mood-b"
          }`}
        >
          <p
            className={`rounded-full border-4 border-ink px-6 py-3 font-display text-2xl text-ink shadow-[4px_4px_0_#07040a] ${
              me.team === "a" ? "bg-coral" : "bg-cyan"
            }`}
          >
            {me.name}
          </p>
          <p className="font-display text-xl text-cream">You’re locked in</p>
          <p className="max-w-xs text-cream/75">
            Keep this phone unlocked — the giant BUZZ button lands when the host starts a game.
          </p>
        </div>
      );
    }

    if (state.phase === "results") {
      const teamScore = state.scores[`team:${me.team}`] ?? 0;
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-4xl text-acid">Game over!</p>
          <p className="text-cream">
            {me.name} scored {teamScore} pts
          </p>
        </div>
      );
    }

    if (active && state.gameState) {
      const PlayerView = active.PlayerView;
      return (
        <PlayerView room={state} playerId={you?.playerId ?? null} onAction={gameAction} />
      );
    }

    return null;
  }, [
    state,
    connected,
    me,
    active,
    you,
    gameAction,
    joinTeam,
    lastError,
    clearError,
    partyUrl,
    pendingTeam,
  ]);

  return (
    <PartyShell
      density="play"
      room={state}
      connected={connected}
      gameLabel={active?.title}
      stageKey={`${state?.phase}-${me?.team ?? "pick"}-${state?.activeGameId ?? "wait"}`}
      stage={stage}
      dock={<span className="text-xs text-cream/50">Room {roomCode}</span>}
    />
  );
}

export default function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const roomCode = code.toUpperCase();

  return (
    <Suspense
      fallback={
        <PartyShell
          density="play"
          stageKey="loading"
          stage={
            <div className="flex h-full items-center justify-center font-display text-2xl">
              Loading…
            </div>
          }
        />
      }
    >
      <PlayInner roomCode={roomCode} />
    </Suspense>
  );
}
