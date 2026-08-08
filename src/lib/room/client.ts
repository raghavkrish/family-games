"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PartySocket from "partysocket";
import type {
  ClientMessage,
  GameAction,
  GameId,
  RoomState,
  ServerMessage,
  TeamId,
} from "@shared/types";
import { WS_CLOSE_CLEARED, WS_CLOSE_ROOM } from "@shared/types";
import { motionBus } from "@/lib/motion";

function isForcedClose(code: number) {
  return code === WS_CLOSE_CLEARED || code === WS_CLOSE_ROOM;
}

/** Party port only — hostname follows the page so phones on LAN work. */
function partyPort() {
  const fromEnv = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
  if (fromEnv?.includes(":")) {
    const port = fromEnv.split(":").pop();
    if (port && /^\d+$/.test(port)) return port;
  }
  return process.env.NEXT_PUBLIC_PARTYKIT_PORT ?? "1999";
}

/**
 * Resolve PartyKit host for the current device.
 * Never use 127.0.0.1 on a phone — use the same hostname as the page (LAN IP).
 */
export function partyHost() {
  const defaultPort = process.env.NEXT_PUBLIC_PARTYKIT_PORT ?? "1999";
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = partyPort();
    const fromEnv = process.env.NEXT_PUBLIC_PARTYKIT_HOST?.trim();

    // Deployed PartyKit host (e.g. project.username.partykit.dev) — use as-is
    if (
      fromEnv &&
      !fromEnv.startsWith("127.") &&
      !fromEnv.startsWith("localhost") &&
      !fromEnv.match(/^\d+\.\d+\.\d+\.\d+/)
    ) {
      return fromEnv.includes(":") ? fromEnv : `${fromEnv}:${port}`;
    }

    // Local / LAN: always match the page host (localhost on TV, 192.168.x on phones)
    return `${hostname}:${port}`;
  }
  return process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? `127.0.0.1:${defaultPort}`;
}

export function createRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export type RoomError = {
  message: string;
  code?: string;
  payload?: Record<string, unknown>;
};

export type RoomClient = {
  state: RoomState | null;
  you: { connectionId: string; playerId: string | null; role: "host" | "player" } | null;
  connected: boolean;
  lastError: RoomError | null;
  partyUrl: string;
  clearError: () => void;
  send: (msg: ClientMessage) => void;
  pickGame: (gameId: GameId) => void;
  joinTeam: (team: "a" | "b", takeover?: boolean) => void;
  setPack: (packId: string) => void;
  endGame: () => void;
  backToLobby: () => void;
  clearConnections: () => void;
  closeRoom: () => void;
  gameAction: (action: GameAction) => void;
};

export function useRoom(code: string, role: "host" | "player") {
  const [state, setState] = useState<RoomState | null>(null);
  const [you, setYou] = useState<RoomClient["you"]>(null);
  const [connected, setConnected] = useState(false);
  const [lastError, setLastError] = useState<RoomError | null>(null);
  const [partyUrl, setPartyUrl] = useState("");
  const socketRef = useRef<PartySocket | null>(null);
  const pendingRef = useRef<ClientMessage[]>([]);
  const rejoinAttempted = useRef(false);

  useEffect(() => {
    if (!code) return;
    rejoinAttempted.current = false;
    pendingRef.current = [];
    const host = partyHost();
    setPartyUrl(host);

    const socket = new PartySocket({
      host,
      room: code.toLowerCase(),
      shouldReconnectOnClose: (event) => !isForcedClose(event.code),
    });
    socketRef.current = socket;

    const clearRoomStorage = () => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(`fg-player-${code}`);
      localStorage.removeItem(`fg-team-${code}`);
    };

    const forceDisconnectLocal = (message: string, errorCode: string, closeCode: number) => {
      clearRoomStorage();
      setLastError({ message, code: errorCode });
      setState(null);
      setYou(null);
      setConnected(false);
      try {
        socket.close(closeCode, errorCode);
      } catch {
        // ignore
      }
    };

    const flushPending = () => {
      const queued = pendingRef.current;
      pendingRef.current = [];
      for (const msg of queued) {
        socket.send(JSON.stringify(msg));
      }
    };

    const onOpen = () => {
      setConnected(true);
      setLastError(null);
      const hello: ClientMessage = {
        type: "hello",
        role,
        name: role === "host" ? "Host" : "Controller",
        playerId:
          role === "player"
            ? (typeof window !== "undefined"
                ? localStorage.getItem(`fg-player-${code}`) ?? undefined
                : undefined)
            : undefined,
      };
      socket.send(JSON.stringify(hello));
      flushPending();
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(String(event.data)) as ServerMessage;
        if (msg.type === "state") {
          setState(msg.state);
          setYou(msg.you);
          if (msg.you.playerId && role === "player") {
            localStorage.setItem(`fg-player-${code}`, msg.you.playerId);
            const me = msg.state.players.find((p) => p.id === msg.you.playerId);
            const storedTeam = localStorage.getItem(`fg-team-${code}`) as "a" | "b" | null;
            if (
              storedTeam &&
              !me?.team &&
              !rejoinAttempted.current &&
              socket.readyState === WebSocket.OPEN
            ) {
              rejoinAttempted.current = true;
              socket.send(
                JSON.stringify({
                  type: "joinTeam",
                  team: storedTeam,
                  takeover: true,
                } satisfies ClientMessage),
              );
            }
            if (me?.team) {
              localStorage.setItem(`fg-team-${code}`, me.team);
            }
          }
        } else if (msg.type === "event") {
          motionBus.emit(msg.event, msg.payload);
          if (msg.payload?.scene) {
            motionBus.emit("scene", { cue: msg.payload.scene });
          }
          if (msg.event === "connections-cleared" && role === "player") {
            forceDisconnectLocal(
              String(msg.payload?.reason ?? "Host cleared all controllers") +
                " — refresh or scan the QR to rejoin.",
              "connections-cleared",
              WS_CLOSE_CLEARED,
            );
          }
          if (msg.event === "room-closed") {
            forceDisconnectLocal(
              String(msg.payload?.reason ?? "Host closed the room") +
                (role === "player" ? " — scan a new QR when the host starts again." : ""),
              "room-closed",
              WS_CLOSE_ROOM,
            );
          }
        } else if (msg.type === "error") {
          setLastError({
            message: msg.message,
            code: msg.code,
            payload: msg.payload,
          });
        }
      } catch {
        // ignore
      }
    };

    const onClose = (event: CloseEvent) => {
      setConnected(false);
      if (event.code === WS_CLOSE_CLEARED && role === "player") {
        clearRoomStorage();
        setLastError({
          message: "Host cleared all controllers — refresh or scan the QR to rejoin.",
          code: "connections-cleared",
        });
        setState(null);
        setYou(null);
      }
      if (event.code === WS_CLOSE_ROOM) {
        clearRoomStorage();
        setLastError({
          message:
            role === "player"
              ? "Room closed — scan a new QR when the host starts again."
              : "Room closed.",
          code: "room-closed",
        });
        setState(null);
        setYou(null);
      }
    };
    const onError = () => {
      setLastError({
        message: `Can't reach party server at ${host}. Open the site via your computer's Wi‑Fi IP (not localhost).`,
        code: "party-unreachable",
      });
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("message", onMessage);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("message", onMessage);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("error", onError);
      socket.close();
      socketRef.current = null;
    };
  }, [code, role]);

  const send = useCallback((msg: ClientMessage) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(msg));
      return;
    }
    pendingRef.current.push(msg);
  }, []);

  const joinTeam = useCallback(
    (team: "a" | "b", takeover = false) => {
      localStorage.setItem(`fg-team-${code}`, team);
      send({ type: "joinTeam", team, takeover });
    },
    [code, send],
  );

  const clearError = useCallback(() => setLastError(null), []);

  const api = useMemo(
    () => ({
      state,
      you,
      connected,
      lastError,
      partyUrl,
      clearError,
      send,
      pickGame: (gameId: GameId) => send({ type: "pickGame", gameId }),
      joinTeam,
      setPack: (packId: string) => send({ type: "setPack", packId }),
      endGame: () => send({ type: "endGame" }),
      backToLobby: () => send({ type: "backToLobby" }),
      clearConnections: () => send({ type: "clearConnections" }),
      closeRoom: () => send({ type: "closeRoom" }),
      gameAction: (action: GameAction) =>
        send({ type: "gameAction", action }),
    }),
    [state, you, connected, lastError, partyUrl, clearError, send, joinTeam],
  );

  return api;
}

export function teamBuzzerOnline(state: RoomState | null, team: "a" | "b") {
  return Boolean(
    state?.players.some((p) => !p.isHost && p.team === team && p.connected),
  );
}

export function teamBuzzerPlayer(state: RoomState | null, team: TeamId) {
  if (!team || !state) return null;
  return state.players.find((p) => !p.isHost && p.team === team && p.connected) ?? null;
}

/** Prefer a LAN-reachable origin for QR codes when host is on localhost. */
export function shareableOrigin() {
  if (typeof window === "undefined") return "";
  const { protocol, hostname, port } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "";
  }
  const portPart = port ? `:${port}` : "";
  return `${protocol}//${hostname}${portPart}`;
}
