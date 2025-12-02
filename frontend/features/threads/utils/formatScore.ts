const SCORE_MIN = -9999;
const SCORE_MAX = 9999;
const OVERFLOW_SUFFIX = "....";

export function formatScore(score: number): string {
    const str = `${score}`;
    if (score >= SCORE_MIN && score <= SCORE_MAX) {
        // Always show the full value, up to 5 characters (including "-9999").
        return str;
    }

    const firstChar = str.charAt(0) || "0";
    return `${firstChar}${OVERFLOW_SUFFIX}`;
}

export const SCORE_DISPLAY_RANGE = { min: SCORE_MIN, max: SCORE_MAX };
