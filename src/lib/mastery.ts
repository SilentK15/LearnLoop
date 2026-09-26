/**
 * LearnLoop Mastery Recomputation Engine
 *
 * Implements: new = old + 0.35 * (outcome - old) * difficulty_weight
 * where outcome = 1.0 (correct) | 0.0 (incorrect)
 * and difficulty_weight accounts for question rigor (1 to 5).
 */

export function calculateDifficultyWeight(difficulty: number): number {
  // Clamped difficulty 1 to 5
  const clampedDiff = Math.max(1, Math.min(5, Math.round(difficulty)));
  // Weight scale: D1=0.6, D2=0.8, D3=1.0 (standard baseline), D4=1.2, D5=1.4
  return Number((1.0 + (clampedDiff - 3) * 0.2).toFixed(2));
}

export function computeNewMastery(
  oldMastery: number,
  isCorrect: boolean,
  difficulty: number
): {
  newMastery: number;
  delta: number;
  difficultyWeight: number;
} {
  const outcome = isCorrect ? 1.0 : 0.0;
  const weight = calculateDifficultyWeight(difficulty);
  const rawDelta = 0.35 * (outcome - oldMastery) * weight;
  
  // New mastery clamped between 0.00 and 1.00
  const unclamped = oldMastery + rawDelta;
  const newMastery = Number(Math.max(0.0, Math.min(1.0, unclamped)).toFixed(3));
  const delta = Number((newMastery - oldMastery).toFixed(3));

  return {
    newMastery,
    delta,
    difficultyWeight: weight,
  };
}

export interface ConceptWithMastery {
  id: string;
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  score: number; // 0.0 to 1.0
  totalQuestions?: number;
  attemptsCount?: number;
}

/**
 * Requirement (3): Recommended next concept is the earliest concept (by orderIndex)
 * with mastery score < 0.60.
 */
export function getRecommendedNextConcept<T extends { orderIndex: number; score: number }>(
  concepts: T[]
): T | null {
  // Sort by linear orderIndex
  const sorted = [...concepts].sort((a, b) => a.orderIndex - b.orderIndex);
  
  // Earliest concept with score < 0.60
  const candidate = sorted.find((c) => c.score < 0.6);
  if (candidate) return candidate;

  // If all are >= 0.60, return the lowest mastery concept, or null if all mastered >= 0.95
  const lowest = sorted.reduce((min, curr) => (curr.score < min.score ? curr : min), sorted[0]);
  return lowest ?? null;
}

export function getMasteryBadge(score: number): {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
} {
  if (score >= 0.8) {
    return {
      label: "Mastered",
      textColor: "text-[#2B5D4F]",
      bgColor: "bg-[#2B5D4F]/10",
      borderColor: "border-[#2B5D4F]/30",
    };
  }
  if (score >= 0.6) {
    return {
      label: "Proficient",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    };
  }
  if (score >= 0.3) {
    return {
      label: "Needs Review",
      textColor: "text-amber-800",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
    };
  }
  return {
    label: "Critical Gap",
    textColor: "text-[#B4472A]",
    bgColor: "bg-[#B4472A]/10",
    borderColor: "border-[#B4472A]/30",
  };
}
