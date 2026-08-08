import type { BuzzerRoundState, GameAction, GameContext, Scores } from "./types";
import { answersMatch } from "./normalize";

export type ClueLike = {
  id: string;
  answer: string;
  accept: string[];
};

export function createBuzzerState(clueIds: string[]): BuzzerRoundState {
  return {
    mode: "idle",
    clueIndex: 0,
    clueIds,
    lockedBy: null,
    submittedAnswer: null,
    lastResult: null,
  };
}

export function shuffleIds<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function award(
  scores: Scores,
  players: GameContext["players"],
  playerId: string,
  points: number,
): Scores {
  const next = { ...scores };
  next[playerId] = (next[playerId] ?? 0) + points;
  const player = players.find((p) => p.id === playerId);
  if (player?.team) {
    const key = `team:${player.team}`;
    next[key] = (next[key] ?? 0) + points;
  }
  return next;
}

export function reduceBuzzer(
  state: BuzzerRoundState,
  action: GameAction,
  ctx: GameContext,
  clues: ClueLike[],
  pointsCorrect = 10,
): { state: BuzzerRoundState; scores: Scores; event?: string; payload?: Record<string, unknown> } {
  const clue = clues.find((c) => c.id === state.clueIds[state.clueIndex]);
  let scores = ctx.scores;

  switch (action.type) {
    case "startRound": {
      if (state.mode !== "idle" && state.mode !== "reveal") {
        return { state, scores };
      }
      return {
        state: {
          ...state,
          mode: "open",
          lockedBy: null,
          submittedAnswer: null,
          lastResult: null,
        },
        scores,
        event: "round-open",
      };
    }
    case "buzz": {
      if (state.mode !== "open") return { state, scores };
      const buzzer = ctx.players.find((p) => p.id === action.playerId);
      return {
        state: {
          ...state,
          mode: "locked",
          lockedBy: action.playerId,
          submittedAnswer: null,
        },
        scores,
        event: "buzz-lock",
        payload: {
          playerId: action.playerId,
          team: buzzer?.team ?? null,
          teamLabel:
            buzzer?.team === "a"
              ? "TEAM A"
              : buzzer?.team === "b"
                ? "TEAM B"
                : "BUZZED!",
        },
      };
    }
    case "submitAnswer": {
      if (state.mode !== "locked" || state.lockedBy !== action.playerId) {
        return { state, scores };
      }
      return {
        state: { ...state, submittedAnswer: action.answer },
        scores,
      };
    }
    case "judge": {
      if (state.mode !== "locked" || !state.lockedBy) return { state, scores };
      const auto =
        state.submittedAnswer && clue
          ? answersMatch(state.submittedAnswer, [clue.answer, ...clue.accept])
          : action.correct;
      const correct = action.correct || auto;
      if (correct) {
        scores = award(scores, ctx.players, state.lockedBy, pointsCorrect);
        return {
          state: {
            ...state,
            mode: "reveal",
            lastResult: "correct",
          },
          scores,
          event: "correct",
          payload: { playerId: state.lockedBy },
        };
      }
      return {
        state: {
          ...state,
          mode: "open",
          lockedBy: null,
          submittedAnswer: null,
          lastResult: "wrong",
        },
        scores,
        event: "wrong",
        payload: { playerId: state.lockedBy },
      };
    }
    case "nextRound": {
      const nextIndex = state.clueIndex + 1;
      if (nextIndex >= state.clueIds.length) {
        return {
          state: { ...state, mode: "reveal", lastResult: state.lastResult },
          scores,
          event: "game-complete",
        };
      }
      return {
        state: {
          ...state,
          clueIndex: nextIndex,
          mode: "idle",
          lockedBy: null,
          submittedAnswer: null,
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
