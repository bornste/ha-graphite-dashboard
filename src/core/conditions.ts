// Simple value conditions used by several cards (chips, info highlight, ...).
import { unavailableStates } from "./format";

export interface ValueCondition {
  entity?: string;
  above?: number | string;
  below?: number | string;
  state?: string | number | Array<string | number>;
}

// condition {above, below, state} against a state value; no condition or an invalid state never matches
export function matchesCondition(condition: ValueCondition | undefined, state: string | undefined): boolean {
  if (!condition || state === undefined || unavailableStates.includes(state)) return false;
  const number = Number(state);
  if (condition.above !== undefined && !(number > Number(condition.above))) return false;
  if (condition.below !== undefined && !(number < Number(condition.below))) return false;
  if (condition.state !== undefined && !([] as Array<string | number>).concat(condition.state).map(String).includes(String(state))) return false;
  return true;
}
