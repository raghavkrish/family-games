export type RoomPhase = "lobby" | "pickGame" | "playing" | "results";

export type TeamId = "a" | "b" | null;

export type Player = {
  id: string;
  name: string;
  team: TeamId;
  connected: boolean;
  isHost: boolean;
};

export type Scores = Record<string, number>; // playerId or team:a / team:b

export type GameId = "tent-kottai" | "sound-party" | "tamil-charades";

export type RoomState = {
  code: string;
  packId: string;
  players: Player[];
  scores: Scores;
  phase: RoomPhase;
  activeGameId: GameId | null;
  gameState: unknown | null;
  hostConnectionId: string | null;
};

export type ClientMessage =
  | { type: "hello"; role: "host" | "player"; name?: string; playerId?: string }
  | { type: "setName"; name: string }
  | { type: "joinTeam"; team: "a" | "b"; takeover?: boolean }
  | { type: "assignTeams"; assignments: { playerId: string; team: TeamId }[] }
  | { type: "shuffleTeams" }
  | { type: "setPack"; packId: string }
  | { type: "pickGame"; gameId: GameId }
  | { type: "endGame" }
  | { type: "backToLobby" }
  | { type: "gameAction"; action: GameAction };

export type ServerMessage =
  | { type: "state"; state: RoomState; you: { connectionId: string; playerId: string | null; role: "host" | "player" } }
  | { type: "error"; message: string; code?: string; payload?: Record<string, unknown> }
  | { type: "event"; event: string; payload?: Record<string, unknown> };

export function teamLabel(team: "a" | "b"): string {
  return team === "a" ? "Team A" : "Team B";
}

export type GameAction =
  | { type: "buzz"; playerId: string }
  | { type: "submitAnswer"; playerId: string; answer: string }
  | { type: "judge"; correct: boolean }
  | { type: "nextRound" }
  | { type: "startRound" }
  | { type: "charadesCorrect" }
  | { type: "charadesSkip" }
  | { type: "setActor"; playerId: string }
  | { type: "tick" };

export type GameContext = {
  players: Player[];
  scores: Scores;
  packId: string;
};

export type BuzzerRoundState = {
  mode: "idle" | "open" | "locked" | "reveal";
  clueIndex: number;
  clueIds: string[];
  lockedBy: string | null;
  submittedAnswer: string | null;
  lastResult: "correct" | "wrong" | null;
};

export type TentKottaiState = BuzzerRoundState & {
  gameId: "tent-kottai";
};

export type SoundPartyState = BuzzerRoundState & {
  gameId: "sound-party";
  audioPlaying: boolean;
};

export type CharadesState = {
  gameId: "tamil-charades";
  mode: "idle" | "acting" | "reveal";
  clueIndex: number;
  clueIds: string[];
  actorId: string | null;
  actingTeam: TeamId;
  endsAt: number | null;
  lastResult: "correct" | "skip" | null;
};
