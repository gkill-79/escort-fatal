import { prisma } from '../prisma';
import { meiliClient } from '../meilisearch';

/**
 * Available Boost Packages (Visibility Tier)
 * Units: Credits (Monetary)
 */
export const BOOST_PACKAGES = {
  TOP_GIRL_24H: { cost: 500, multiplier: 100.0, durationHours: 24 },
  HIGHLIGHT_7D: { cost: 1500, multiplier: 50.0, durationHours: 168 },
  FEATURED_30D: { cost: 5000, multiplier: 25.0, durationHours: 720 },
};

export async function purchaseBoost(
  userId: string, 
  profileId: string, 
  packageType: keyof typeof BOOST_PACKAGES
) {
  const pack = BOOST_PACKAGES[packageType];

  return await prisma.$transaction(async (tx) => {
    // 1. Check user digital wallet
    const user = await tx.user.findUnique({ 
        where: { id: userId },
        select: { id: true, creditsBalance: true }
    });

    if (!user || user.creditsBalance < pack.cost) {
      throw new Error("Crédits insuffisants. Rechargez votre portefeuille pour booster votre profil.");
    }

    // 2. ACID Transaction: Deduct & Apply
    await tx.user.update({
      where: { id: userId },
      data: { creditsBalance: { decrement: pack.cost } }
    });

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + pack.durationHours);

    const updatedProfile = await tx.profile.update({
      where: { id: profileId },
      data: {
        boostScore: pack.multiplier,
        boostExpires: expirationDate,
        isTopGirl: packageType.includes("TOP_GIRL") // Set flag if top-tier
      },
      include: {
          city: true,
          department: true
      }
    });

    // 3. Real-time Search Synchronization
    try {
        const index = meiliClient.index('profiles');
        await index.addDocuments([{
            id: updatedProfile.id,
            boostScore: updatedProfile.boostScore,
            isTopGirl: updatedProfile.isTopGirl,
            // We only update what changed for performance
        }]);
        console.log(`🚀 Boost synchronized to Meilisearch for profile: ${profileId}`);
    } catch (meiliError) {
        console.error("⚠️ Meilisearch sync failed after boost purchase:", meiliError);
        // We don't roll back the DB transaction because the money was spent
        // A background sync job should handle this if search is stale
    }

    return updatedProfile;
  });
}
