import type {
  BuzzerRoundState,
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

function puzzleTileCount(puzzle?: {
  emojiClues?: string[];
  imageUrls?: string[];
}): number {
  if (!puzzle) return 0;
  if (puzzle.imageUrls?.length) return puzzle.imageUrls.length;
  if (puzzle.emojiClues?.length) return puzzle.emojiClues.length;
  return 2; // fallback placeholders in UI
}

export function createGameState(
  gameId: GameId,
  packId: string,
): TentKottaiState | SoundPartyState | CharadesState {
  const pack = getPack(packId);

  if (gameId === "tent-kottai") {
    const ids = shuffleIds(pack.games["tent-kottai"].puzzles.map((p) => p.id));
    return { gameId, revealedCount: 0, ...createBuzzerState(ids) };
  }

  if (gameId === "sound-party") {
    const ids = shuffleIds(pack.games["sound-party"].tracks.map((t) => t.id));
    return {
      gameId,
      audioPlaying: true,
      ...createBuzzerState(ids),
      mode: "open",
    };
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
    const puzzles = pack.games["tent-kottai"].puzzles;

    if (action.type === "revealNext") {
      const puzzle = puzzles.find((p) => p.id === s.clueIds[s.clueIndex]);
      const tileCount = puzzleTileCount(puzzle);
      if (s.revealedCount >= tileCount) {
        return { state: s, scores: ctx.scores };
      }
      const revealedCount = s.revealedCount + 1;
      // First visible clue opens buzzers — no separate Open Buzzers step.
      const openBuzzers = s.mode === "idle";
      return {
        state: {
          ...s,
          revealedCount,
          ...(openBuzzers
            ? {
                mode: "open" as const,
                lockedBy: null,
                submittedAnswer: null,
                lastResult: null,
              }
            : {}),
        },
        scores: ctx.scores,
        event: openBuzzers ? "round-open" : "clue-reveal",
        payload: { revealedCount, tileCount },
      };
    }

    const result = reduceBuzzer(s, action, ctx, puzzles, rules.pointsCorrect);
    const nextBase = result.state as BuzzerRoundState;
    const revealedCount =
      action.type === "nextRound" && result.event !== "game-complete"
        ? 0
        : (s.revealedCount ?? 0);
    return {
      ...result,
      state: {
        ...nextBase,
        gameId: "tent-kottai" as const,
        revealedCount,
      },
    };
  }

  if (gameId === "sound-party") {
    const s = state as SoundPartyState;
    const rules = pack.games["sound-party"].rules;
    const clues = pack.games["sound-party"].tracks.map((t) => ({
      id: t.id,
      answer: t.title,
      accept: t.accept,
    }));
    const result = reduceBuzzer(s, action, ctx, clues, rules.pointsCorrect);
    // Auto-open on each new track (start + next) so hosts never need Open Buzzers.
    const autoOpen =
      action.type === "nextRound" && result.event !== "game-complete";
    const mode = autoOpen ? ("open" as const) : result.state.mode;
    const audioPlaying = mode === "open" || action.type === "startRound";
    return {
      ...result,
      state: {
        ...result.state,
        mode,
        gameId: "sound-party" as const,
        audioPlaying,
      },
      event: autoOpen ? "round-open" : result.event,
      payload: {
        ...(result.payload ?? {}),
        ...(action.type === "startRound" || autoOpen
          ? { scene: "vinyl-spin" }
          : {}),
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
