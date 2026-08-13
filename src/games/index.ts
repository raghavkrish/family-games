import type { ComponentType } from "react";
import type { GameAction, GameId, RoomState } from "@shared/types";
import { TentKottaiHost, TentKottaiPlayer } from "@/games/tent-kottai/views";
import { SoundPartyHost, SoundPartyPlayer } from "@/games/sound-party/views";
import { CharadesHost, CharadesPlayer } from "@/games/tamil-charades/views";

export type GameViewProps = {
  room: RoomState;
  playerId: string | null;
  onAction: (action: GameAction) => void;
};

export type GameModule = {
  id: GameId;
  title: string;
  blurb: string;
  accent: string;
  minPlayers: number;
  maxPlayers: number;
  HostView: ComponentType<GameViewProps>;
  PlayerView: ComponentType<GameViewProps>;
};

export const GAMES: GameModule[] = [
  {
    id: "tent-kottai-movies",
    title: "Panchathanthiram",
    blurb: "Picture connexions — Tamil films. Buzz first, guess wild.",
    accent: "bg-cyan",
    minPlayers: 2,
    maxPlayers: 12,
    HostView: TentKottaiHost,
    PlayerView: TentKottaiPlayer,
  },
  {
    id: "tent-kottai-songs",
    title: "Isaignani",
    blurb: "Picture connexions — Tamil songs. Buzz first, guess wild.",
    accent: "bg-cyan",
    minPlayers: 2,
    maxPlayers: 12,
    HostView: TentKottaiHost,
    PlayerView: TentKottaiPlayer,
  },
  {
    id: "sound-party",
    title: "Keladi Kanmani",
    blurb: "Tamil song clips. Name that tune!",
    accent: "bg-coral",
    minPlayers: 2,
    maxPlayers: 12,
    HostView: SoundPartyHost,
    PlayerView: SoundPartyPlayer,
  },
  {
    id: "tamil-charades",
    title: "Nee Nadigan da!",
    blurb: "Act out Tamil movies. No talking… or maybe a little.",
    accent: "bg-acid",
    minPlayers: 4,
    maxPlayers: 12,
    HostView: CharadesHost,
    PlayerView: CharadesPlayer,
  },
];

export function getGame(id: GameId) {
  return GAMES.find((g) => g.id === id);
}
