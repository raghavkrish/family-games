import type * as Party from "partykit/server";
import type {
  ClientMessage,
  Player,
  RoomState,
  ServerMessage,
  TeamId,
} from "../shared/types";
import { createGameState, reduceGame } from "../shared/games";

function roomCodeFromId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "PARTY1";
}

function broadcastState(room: Party.Room, state: RoomState) {
  for (const conn of room.getConnections()) {
    const player = state.players.find((p) => p.id === conn.id);
    const role = state.hostConnectionId === conn.id ? "host" : "player";
    const msg: ServerMessage = {
      type: "state",
      state,
      you: {
        connectionId: conn.id,
        playerId: player?.id ?? (role === "host" ? null : conn.id),
        role,
      },
    };
    conn.send(JSON.stringify(msg));
  }
}

function sendError(
  conn: Party.Connection,
  message: string,
  code?: string,
  payload?: Record<string, unknown>,
) {
  const msg: ServerMessage = { type: "error", message, code, payload };
  conn.send(JSON.stringify(msg));
}

function teamDisplayName(team: "a" | "b"): string {
  return team === "a" ? "Team A" : "Team B";
}

function claimTeam(
  state: RoomState,
  senderId: string,
  team: "a" | "b",
  takeover: boolean,
): { state: RoomState; error?: { message: string; code: string; payload?: Record<string, unknown> } } {
  const occupant = state.players.find(
    (p) => !p.isHost && p.team === team && p.id !== senderId && p.connected,
  );
  if (occupant && !takeover) {
    return {
      state,
      error: {
        message: `${teamDisplayName(team)} already has a buzzer`,
        code: "team-taken",
        payload: { team },
      },
    };
  }

  let players = [...state.players];
  if (!players.some((p) => p.id === senderId)) {
    players.push({
      id: senderId,
      name: teamDisplayName(team),
      team: null,
      connected: true,
      isHost: false,
    });
  }

  players = players.map((p) => {
    if (p.id === senderId) {
      return {
        ...p,
        team,
        name: teamDisplayName(team),
        connected: true,
        isHost: false,
      };
    }
    // Evict anyone else currently claiming this team
    if (p.team === team) {
      return { ...p, team: null };
    }
    return p;
  });

  return {
    state: {
      ...state,
      players,
      scores: { ...state.scores, [senderId]: state.scores[senderId] ?? 0 },
    },
  };
}

function sendEvent(
  room: Party.Room,
  event: string,
  payload?: Record<string, unknown>,
) {
  const msg: ServerMessage = { type: "event", event, payload };
  room.broadcast(JSON.stringify(msg));
}

function shuffleTeams(players: Player[]): Player[] {
  const nonHost = players.filter((p) => !p.isHost);
  const shuffled = [...nonHost].sort(() => Math.random() - 0.5);
  return players.map((p) => {
    if (p.isHost) return { ...p, team: null as TeamId };
    const idx = shuffled.findIndex((s) => s.id === p.id);
    return { ...p, team: (idx % 2 === 0 ? "a" : "b") as TeamId };
  });
}

export default class Server implements Party.Server {
  state: RoomState;

  constructor(readonly room: Party.Room) {
    this.state = {
      code: roomCodeFromId(room.id),
      packId: "tamil-party",
      players: [],
      scores: {},
      phase: "lobby",
      activeGameId: null,
      gameState: null,
      hostConnectionId: null,
    };
  }

  onConnect(conn: Party.Connection) {
    broadcastState(this.room, this.state);
    void conn;
  }

  onClose(conn: Party.Connection) {
    this.state = {
      ...this.state,
      players: this.state.players.map((p) =>
        p.id === conn.id ? { ...p, connected: false } : p,
      ),
      hostConnectionId:
        this.state.hostConnectionId === conn.id
          ? null
          : this.state.hostConnectionId,
    };
    broadcastState(this.room, this.state);
  }

  onMessage(message: string, sender: Party.Connection) {
    let data: ClientMessage;
    try {
      data = JSON.parse(message) as ClientMessage;
    } catch {
      sendError(sender, "Invalid message");
      return;
    }

    switch (data.type) {
      case "hello": {
        if (data.role === "host") {
          this.state = {
            ...this.state,
            hostConnectionId: sender.id,
            players: this.state.players.some((p) => p.id === sender.id)
              ? this.state.players.map((p) =>
                  p.id === sender.id
                    ? { ...p, connected: true, isHost: true, name: data.name ?? p.name }
                    : p,
                )
              : [
                  ...this.state.players,
                  {
                    id: sender.id,
                    name: data.name ?? "Host",
                    team: null,
                    connected: true,
                    isHost: true,
                  },
                ],
          };
        } else {
          const existing = data.playerId
            ? this.state.players.find((p) => p.id === data.playerId)
            : this.state.players.find((p) => p.id === sender.id);
          if (existing && data.playerId && existing.id !== sender.id) {
            // reconnect with new connection id — migrate
            this.state = {
              ...this.state,
              players: this.state.players.map((p) =>
                p.id === data.playerId
                  ? {
                      ...p,
                      id: sender.id,
                      connected: true,
                      name: data.name ?? p.name,
                    }
                  : p,
              ),
              scores: migrateScoreKey(this.state.scores, data.playerId!, sender.id),
            };
          } else if (!this.state.players.some((p) => p.id === sender.id)) {
            this.state = {
              ...this.state,
              players: [
                ...this.state.players,
                {
                  id: sender.id,
                  name: data.name ?? `Player ${this.state.players.length + 1}`,
                  team: null,
                  connected: true,
                  isHost: false,
                },
              ],
              scores: { ...this.state.scores, [sender.id]: 0 },
            };
          } else {
            this.state = {
              ...this.state,
              players: this.state.players.map((p) =>
                p.id === sender.id
                  ? {
                      ...p,
                      connected: true,
                      name: data.name ?? p.name,
                    }
                  : p,
              ),
            };
          }
        }
        broadcastState(this.room, this.state);
        break;
      }
      case "setName": {
        this.state = {
          ...this.state,
          players: this.state.players.map((p) =>
            p.id === sender.id ? { ...p, name: data.name.slice(0, 18) } : p,
          ),
        };
        broadcastState(this.room, this.state);
        break;
      }
      case "joinTeam": {
        if (sender.id === this.state.hostConnectionId) {
          sendError(sender, "Host cannot claim a team buzzer");
          return;
        }
        // Ensure player row exists
        if (!this.state.players.some((p) => p.id === sender.id)) {
          this.state = {
            ...this.state,
            players: [
              ...this.state.players,
              {
                id: sender.id,
                name: "Controller",
                team: null,
                connected: true,
                isHost: false,
              },
            ],
          };
        }
        const result = claimTeam(
          this.state,
          sender.id,
          data.team,
          Boolean(data.takeover),
        );
        if (result.error) {
          sendError(
            sender,
            result.error.message,
            result.error.code,
            result.error.payload,
          );
          return;
        }
        this.state = result.state;
        broadcastState(this.room, this.state);
        sendEvent(this.room, "team-joined", {
          team: data.team,
          playerId: sender.id,
        });
        break;
      }
      case "assignTeams": {
        if (sender.id !== this.state.hostConnectionId) {
          sendError(sender, "Only host can assign teams");
          return;
        }
        const map = new Map(data.assignments.map((a) => [a.playerId, a.team]));
        this.state = {
          ...this.state,
          players: this.state.players.map((p) =>
            map.has(p.id) ? { ...p, team: map.get(p.id)! } : p,
          ),
        };
        broadcastState(this.room, this.state);
        break;
      }
      case "shuffleTeams": {
        if (sender.id !== this.state.hostConnectionId) return;
        this.state = { ...this.state, players: shuffleTeams(this.state.players) };
        broadcastState(this.room, this.state);
        sendEvent(this.room, "teams-shuffled");
        break;
      }
      case "setPack": {
        if (sender.id !== this.state.hostConnectionId) return;
        this.state = { ...this.state, packId: data.packId };
        broadcastState(this.room, this.state);
        break;
      }
      case "pickGame": {
        if (sender.id !== this.state.hostConnectionId) return;
        const gameState = createGameState(data.gameId, this.state.packId);
        this.state = {
          ...this.state,
          phase: "playing",
          activeGameId: data.gameId,
          gameState,
        };
        broadcastState(this.room, this.state);
        sendEvent(this.room, "game-start", { gameId: data.gameId });
        break;
      }
      case "endGame":
      case "backToLobby": {
        if (sender.id !== this.state.hostConnectionId) return;
        this.state = {
          ...this.state,
          phase: data.type === "backToLobby" ? "lobby" : "pickGame",
          activeGameId: null,
          gameState: null,
        };
        broadcastState(this.room, this.state);
        break;
      }
      case "gameAction": {
        if (!this.state.activeGameId || !this.state.gameState) return;
        const isHost = sender.id === this.state.hostConnectionId;
        let action = data.action;
        const hostOnly = new Set([
          "judge",
          "nextRound",
          "startRound",
          "charadesCorrect",
          "charadesSkip",
          "setActor",
        ]);
        if (hostOnly.has(action.type) && !isHost) {
          sendError(sender, "Only host can do that");
          return;
        }
        if (action.type === "buzz" || action.type === "submitAnswer") {
          action = { ...action, playerId: sender.id };
        }
        const result = reduceGame(
          this.state.activeGameId,
          this.state.gameState,
          action,
          {
            players: this.state.players,
            scores: this.state.scores,
            packId: this.state.packId,
          },
        );
        this.state = {
          ...this.state,
          gameState: result.state,
          scores: result.scores,
          phase: result.event === "game-complete" ? "results" : this.state.phase,
        };
        broadcastState(this.room, this.state);
        if (result.event) {
          sendEvent(this.room, result.event, result.payload);
        }
        break;
      }
      default:
        sendError(sender, "Unknown message");
    }
  }
}

function migrateScoreKey(scores: RoomState["scores"], from: string, to: string) {
  const next = { ...scores };
  if (from in next) {
    next[to] = next[from];
    delete next[from];
  }
  return next;
}

Server satisfies Party.Worker;
