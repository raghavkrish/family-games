import type {
  CharadesState,
  GameAction,
  GameContext,
  GameId,
  Scores,
  SoundPartyState,
  TentKottaiState,
} from "./types";
import { createBuzzerState, reduceBuzzer, shuffleIds } from "./buzzer";
import { getPack } from "./packs";

export function createGameState(
  gameId: GameId,
  packId: string,
): TentKottaiState | SoundPartyState | CharadesState {
  const pack = getPack(packId);

  if (gameId === "tent-kottai") {
    const ids = shuffleIds(pack.games["tent-kottai"].puzzles.map((p) => p.id));
    return { gameId, ...createBuzzerState(ids) };
  }

  if (gameId === "sound-party") {
    const ids = shuffleIds(pack.games["sound-party"].tracks.map((t) => t.id));
    return { gameId, audioPlaying: false, ...createBuzzerState(ids) };
  }

  const movies = pack.games["tamil-charades"].movies;
  const ids = shuffleIds(movies.map((m) => m.id));
  return {
    gameId: "tamil-charades",
    mode: "idle",
    clueIndex: 0,
    clueIds: ids,
    actorId: null,
    actingTeam: "a",
    endsAt: null,
    lastResult: null,
  };
}

export function reduceGame(
  gameId: GameId,
  state: unknown,
  action: GameAction,
  ctx: GameContext,
): { state: unknown; scores: Scores; event?: string; payload?: Record<string, unknown> } {
  const pack = getPack(ctx.packId);

  if (gameId === "tent-kottai") {
    const s = state as TentKottaiState;
    const rules = pack.games["tent-kottai"].rules;
    const result = reduceBuzzer(s, action, ctx, pack.games["tent-kottai"].puzzles, rules.pointsCorrect);
    return { ...result, state: { ...result.state, gameId: "tent-kottai" } };
  }

  if (gameId === "sound-party") {
    const s = state as SoundPartyState;
    const rules = pack.games["sound-party"].rules;
    const clues = pack.games["sound-party"].tracks.map((t) => ({
      id: t.id,
      answer: t.title,
      accept: t.accept,
    }));
    if (action.type === "startRound") {
      const result = reduceBuzzer(s, action, ctx, clues, rules.pointsCorrect);
      return {
        ...result,
        state: { ...result.state, gameId: "sound-party", audioPlaying: true },
        event: result.event ?? "round-open",
        payload: { ...(result.payload ?? {}), scene: "vinyl-spin" },
      };
    }
    const result = reduceBuzzer(s, action, ctx, clues, rules.pointsCorrect);
    return {
      ...result,
      state: {
        ...result.state,
        gameId: "sound-party",
        audioPlaying: result.state.mode === "open",
      },
    };
  }

  return reduceCharades(state as CharadesState, action, ctx, pack.games["tamil-charades"]);
}

function reduceCharades(
  state: CharadesState,
  action: GameAction,
  ctx: GameContext,
  packSection: {
    movies: { id: string; title: string; accept: string[] }[];
    rules: { seconds: number; pointsCorrect: number };
  },
): { state: CharadesState; scores: Scores; event?: string; payload?: Record<string, unknown> } {
  let scores = ctx.scores;
  const { rules } = packSection;

  switch (action.type) {
    case "setActor": {
      return {
        state: { ...state, actorId: action.playerId },
        scores,
      };
    }
    case "startRound": {
      const teamBuzzer =
        ctx.players.find(
          (p) => p.team === state.actingTeam && !p.isHost && p.connected,
        ) ??
        ctx.players.find((p) => p.team === state.actingTeam && !p.isHost);
      const actor = teamBuzzer?.id ?? state.actorId ?? null;
      return {
        state: {
          ...state,
          mode: "acting",
          actorId: actor,
          endsAt: Date.now() + rules.seconds * 1000,
          lastResult: null,
        },
        scores,
        event: "charades-start",
        payload: { scene: "reel-spin" },
      };
    }
    case "charadesCorrect": {
      if (state.mode !== "acting" || !state.actorId) return { state, scores };
      scores = {
        ...scores,
        [state.actorId]: (scores[state.actorId] ?? 0) + rules.pointsCorrect,
        [`team:${state.actingTeam}`]:
          (scores[`team:${state.actingTeam}`] ?? 0) + rules.pointsCorrect,
      };
      return {
        state: { ...state, mode: "reveal", lastResult: "correct", endsAt: null },
        scores,
        event: "correct",
        payload: { playerId: state.actorId },
      };
    }
    case "charadesSkip": {
      if (state.mode !== "acting") return { state, scores };
      return {
        state: { ...state, mode: "reveal", lastResult: "skip", endsAt: null },
        scores,
        event: "wrong",
      };
    }
    case "nextRound": {
      const nextIndex = state.clueIndex + 1;
      const nextTeam = state.actingTeam === "a" ? "b" : "a";
      if (nextIndex >= state.clueIds.length) {
        return {
          state: { ...state, mode: "reveal" },
          scores,
          event: "game-complete",
        };
      }
      return {
        state: {
          ...state,
          clueIndex: nextIndex,
          mode: "idle",
          actingTeam: nextTeam,
          actorId: null,
          endsAt: null,
          lastResult: null,
        },
        scores,
        event: "next-clue",
      };
    }
    default:
      return { state, scores };
  }
}
