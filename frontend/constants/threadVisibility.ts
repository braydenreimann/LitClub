export const HIDDEN_SCORE_THRESHOLD = -10;

export function isHiddenByScore(score: number | null | undefined): boolean {
    if (typeof score !== "number") return false;
    return score <= HIDDEN_SCORE_THRESHOLD;
}
