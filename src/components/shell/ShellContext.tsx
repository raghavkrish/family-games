"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Player, RoomState } from "@shared/types";

export type ShellDensity = "landing" | "host" | "play";

type ShellContextValue = {
  density: ShellDensity;
  roomCode?: string;
  gameLabel?: string;
  packLabel?: string;
  players: Player[];
  scores: Record<string, number>;
  isHost: boolean;
  connected: boolean;
};

const ShellContext = createContext<ShellContextValue>({
  density: "landing",
  players: [],
  scores: {},
  isHost: false,
  connected: false,
});

export function useShell() {
  return useContext(ShellContext);
}

export function ShellProvider({
  children,
  density,
  room,
  isHost = false,
  connected = false,
  gameLabel,
  packLabel,
}: {
  children: ReactNode;
  density: ShellDensity;
  room?: RoomState | null;
  isHost?: boolean;
  connected?: boolean;
  gameLabel?: string;
  packLabel?: string;
}) {
  const value = useMemo<ShellContextValue>(
    () => ({
      density,
      roomCode: room?.code,
      gameLabel,
      packLabel,
      players: room?.players ?? [],
      scores: room?.scores ?? {},
      isHost,
      connected,
    }),
    [density, room, isHost, connected, gameLabel, packLabel],
  );

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}
