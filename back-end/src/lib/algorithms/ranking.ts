/**
 * Algorithm: Time-Decay Hot Score
 * Used for "Top 100 Photos" to ensure fresh content rises while maintaining stability for highly upvoted media.
 * Formula: (Upvotes - Downvotes) / (Age_in_hours + 2)^1.8
 */
export function calculateHotScore(upvotes: number, downvotes: number, createdAt: Date): number {
  const points = upvotes - downvotes;
  
  // Neutralize negative points
  const netPoints = points > 0 ? points : 0;

  // Age in hours
  const ageInMs = Date.now() - new Date(createdAt).getTime();
  const ageInHours = ageInMs / (1000 * 60 * 60);

  /**
   * Gravity constant.
   * 1.8 = Rapid decay (~24h dominance)
   * 1.5 = Moderate decay
   */
  const gravity = 1.8;

  // Decay calculation
  const score = netPoints / Math.pow(ageInHours + 2, gravity);
  
  return score;
}
