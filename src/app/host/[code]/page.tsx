"use client";

import { use, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { PartyShell } from "@/components/shell/PartyShell";
import { teamBuzzerOnline, useRoom } from "@/lib/room/client";
import { GAMES, getGame } from "@/games";
import { listPacks } from "@shared/packs";
import type { GameId } from "@shared/types";
import { lobbyEnter, teamReadyPop, useGsapReady } from "@/lib/motion";

function HostLobby({
  joinUrl,
  roomCode,
  onLocalhost,
  teamAReady,
  teamBReady,
  packId,
  setPack,
  pickGame,
}: {
  joinUrl: string;
  roomCode: string;
  onLocalhost: boolean;
  teamAReady: boolean;
  teamBReady: boolean;
  packId: string;
  setPack: (id: string) => void;
  pickGame: (id: GameId) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const teamARef = useRef<HTMLDivElement>(null);
  const teamBRef = useRef<HTMLDivElement>(null);
  const ready = useGsapReady();
  const prevA = useRef(false);
  const prevB = useRef(false);

  useEffect(() => {
    if (!ready || !rootRef.current) return;
    lobbyEnter(rootRef.current);
  }, [ready]);

  useEffect(() => {
    if (teamAReady && !prevA.current) teamReadyPop(teamARef.current);
    prevA.current = teamAReady;
  }, [teamAReady]);

  useEffect(() => {
    if (teamBReady && !prevB.current) teamReadyPop(teamBRef.current);
    prevB.current = teamBReady;
  }, [teamBReady]);

  return (
    <div ref={rootRef} className="grid h-full gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="lobby-qr flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-ink bg-cream p-6 text-ink shadow-[8px_8px_0_#ff3d6e]">
        <p className="font-display text-sm uppercase tracking-widest">Scan to join a team</p>
        <QRCodeSVG value={joinUrl} size={220} bgColor="transparent" fgColor="#0b0a12" />
        <p className="font-display text-4xl tracking-widest">{roomCode}</p>
        <p className="text-center text-sm text-ink/70 break-all">{joinUrl}</p>
        {onLocalhost && (
          <p className="rounded-xl bg-coral/20 px-3 py-2 text-left text-xs text-ink">
                Phones can’t use localhost. On the TV/laptop open{" "}
                <strong>
                  http://&lt;your-wifi-ip&gt;
                  {typeof window !== "undefined" && window.location.port
                    ? `:${window.location.port}`
                    : ""}
                </strong>{" "}
                (see Next.js “Network” URL), then scan that QR so buzzers hit the same Wi‑Fi host.
          </p>
        )}
        <div className="mt-2 flex w-full gap-3">
          <div
            ref={teamARef}
            className={`lobby-team flex-1 rounded-2xl border-4 border-ink px-3 py-3 text-center font-display ${
              teamAReady ? "bg-coral" : "bg-ink/10 text-ink/40"
            }`}
          >
            Team A
            <p className="text-sm font-sans">{teamAReady ? "Buzzer ready" : "Waiting…"}</p>
          </div>
          <div
            ref={teamBRef}
            className={`lobby-team flex-1 rounded-2xl border-4 border-ink px-3 py-3 text-center font-display ${
              teamBReady ? "bg-cyan" : "bg-ink/10 text-ink/40"
            }`}
          >
            Team B
            <p className="text-sm font-sans">{teamBReady ? "Buzzer ready" : "Waiting…"}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="lobby-title font-display text-4xl text-cream">Pick a game</h2>
          <p className="text-cream/60">Wait for both buzzers, then smash a title.</p>
        </div>
        <label className="text-sm text-cream/70">
          Content pack
          <select
            className="input-chunky mt-1 w-full"
            value={packId}
            onChange={(e) => setPack(e.target.value)}
          >
            {listPacks().map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-3">
          {GAMES.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`lobby-game rounded-3xl border-4 border-ink p-4 text-left shadow-[6px_6px_0_#111] ${g.accent}`}
              onClick={() => pickGame(g.id)}
            >
              <p className="font-display text-2xl text-ink">{g.title}</p>
              <p className="text-ink/75">{g.blurb}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HostPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const roomCode = code.toUpperCase();
  const roomApi = useRoom(roomCode, "host");
  const {
    state,
    connected,
    pickGame,
    setPack,
    endGame,
    backToLobby,
    clearConnections,
    closeRoom,
    gameAction,
  } = roomApi;

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/${roomCode}`
      : `/play/${roomCode}`;
  const onLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const active = state?.activeGameId ? getGame(state.activeGameId) : null;
  const packLabel = listPacks().find((p) => p.id === state?.packId)?.title;
  const teamAReady = teamBuzzerOnline(state, "a");
  const teamBReady = teamBuzzerOnline(state, "b");

  const stage = useMemo(() => {
    if (!state) {
      return (
        <div className="flex h-full items-center justify-center font-display text-3xl text-cream/70">
          Connecting to room…
        </div>
      );
    }

    if (state.phase === "lobby" || state.phase === "pickGame") {
      return (
        <HostLobby
          joinUrl={joinUrl}
          roomCode={roomCode}
          onLocalhost={onLocalhost}
          teamAReady={teamAReady}
          teamBReady={teamBReady}
          packId={state.packId}
          setPack={setPack}
          pickGame={pickGame}
        />
      );
    }

    if (state.phase === "results") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-display text-6xl text-acid">Night scores</h2>
          <div className="flex gap-4">
            <div className="rounded-2xl bg-coral px-6 py-4 font-display text-3xl text-ink">
              Team A {state.scores["team:a"] ?? 0}
            </div>
            <div className="rounded-2xl bg-cyan px-6 py-4 font-display text-3xl text-ink">
              Team B {state.scores["team:b"] ?? 0}
            </div>
          </div>
          <button type="button" className="btn-chunky bg-acid" onClick={endGame}>
            Back to games
          </button>
        </div>
      );
    }

    if (active && state.gameState) {
      const HostView = active.HostView;
      return <HostView room={state} playerId={null} onAction={gameAction} />;
    }

    return null;
  }, [
    state,
    active,
    joinUrl,
    roomCode,
    pickGame,
    setPack,
    endGame,
    gameAction,
    teamAReady,
    teamBReady,
    onLocalhost,
  ]);

  return (
    <PartyShell
      density="host"
      room={state}
      isHost
      connected={connected}
      gameLabel={active?.title}
      packLabel={packLabel}
      stageKey={`${state?.phase}-${state?.activeGameId ?? "none"}-${(state?.gameState as { clueIndex?: number } | null)?.clueIndex ?? 0}`}
      stage={stage}
      dock={
        <>
          {state?.phase === "playing" && (
            <button type="button" className="btn-chunky bg-coral" onClick={endGame}>
              End game
            </button>
          )}
          <button type="button" className="btn-chunky bg-cream" onClick={backToLobby}>
            Lobby
          </button>
          <button
            type="button"
            className="btn-chunky bg-coral/90"
            title="Kick every phone and reset the room to lobby"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm("Clear all phone connections and reset the room?")
              ) {
                return;
              }
              clearConnections();
            }}
          >
            Clear connections
          </button>
          <button
            type="button"
            className="btn-chunky bg-acid"
            title="Close the room for everyone and return home"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm("Close this room for everyone and go home?")
              ) {
                return;
              }
              closeRoom();
              router.push("/");
            }}
          >
            Close room
          </button>
        </>
      }
    />
  );
}
