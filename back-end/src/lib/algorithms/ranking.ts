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

interface ProfileMetrics {
  lastActivityAt: Date;
  calendarUpdatedAt: Date;
  averageResponseTime: number; // en minutes
  activeBoostUntil: Date | null;
  profileCompleteness: number; // % de complétion (0-100)
}

/**
 * Algorithm: Activity Score (The "Engagement Engine")
 * Rewards presence, reliability (calendar), and responsiveness.
 * Max score around 140 (base) * 1.5 (boost) = 210
 */
export function calculateActivityScore(metrics: ProfileMetrics): number {
  let score = 0;
  const now = new Date();

  // 1. Récence de connexion (Prime à la présence) - Max 50 pts
  const hoursSinceActivity = (now.getTime() - new Date(metrics.lastActivityAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceActivity < 1) score += 50; // En ligne ou vu il y a < 1h
  else if (hoursSinceActivity < 6) score += 30;
  else if (hoursSinceActivity < 24) score += 10;

  // 2. Fraîcheur de l'agenda (Récompense la fiabilité) - Max 30 pts
  const daysSinceCalendarUpdate = (now.getTime() - new Date(metrics.calendarUpdatedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCalendarUpdate < 1) score += 30; // Mis à jour aujourd'hui
  else if (daysSinceCalendarUpdate < 3) score += 15;
  else if (daysSinceCalendarUpdate > 7) score -= 20; // PÉNALITÉ : Agenda obsolète

  // 3. Réactivité aux messages (Gamification du Chat) - Max 40 pts
  if (metrics.averageResponseTime <= 5) score += 40; // Réponse quasi instantanée
  else if (metrics.averageResponseTime <= 15) score += 25;
  else if (metrics.averageResponseTime <= 60) score += 10;
  else if (metrics.averageResponseTime > 1440) score -= 30; // PÉNALITÉ : Ghosting (> 24h)

  // 4. Qualité du profil (Fixe) - Max 20 pts
  if (metrics.profileCompleteness >= 90) score += 20;
  else if (metrics.profileCompleteness >= 50) score += 10;

  // 5. Multiplicateur de Boost (Monétisation)
  const isBoosted = metrics.activeBoostUntil && new Date(metrics.activeBoostUntil) > now;
  if (isBoosted) {
    score = score * 1.5; // Le boost augmente le score global de 50%
  }

  return Math.round(score);
}

/**
 * Heuristic to determine profile completion percentage.
 */
export function calculateProfileCompleteness(profile: any): number {
  let points = 0;
  let total = 0;

  const check = (val: any, weight: number) => {
    total += weight;
    if (val && (Array.isArray(val) ? val.length > 0 : true)) points += weight;
  };

  check(profile.bio, 20);
  check(profile.photos, 30); // Has photos
  check(profile.phoneEncrypted, 10);
  check(profile.cityId, 10);
  check(profile.biometricVerified, 30); // Big bonus for verification

  return Math.round((points / total) * 100);
}
