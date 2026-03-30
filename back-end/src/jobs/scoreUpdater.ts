import { Worker, Queue } from 'bullmq';
import { prisma } from '../lib/prisma';
import { calculateHotScore } from '../lib/algorithms/ranking';
import { meiliClient } from '../lib/meilisearch';

// Connection to Redis for BullMQ
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
};

/**
 * Recurring Jobs Queue (CRON)
 */
export const cronQueue = new Queue('cron-jobs', { connection });

// Schedule: Hourly Hot Score recalculation
cronQueue.add('update-hot-scores', {}, { 
    repeat: { pattern: '0 * * * *' },
    removeOnComplete: true
});

// Schedule: Every 15 minutes for expired boosts cleanup
cronQueue.add('reset-expired-boosts', {}, { 
    repeat: { pattern: '*/15 * * * *' },
    removeOnComplete: true
});

// Schedule: Every 15 minutes for Activity Scores recalculation
cronQueue.add('update-activity-scores', {}, { 
  repeat: { pattern: '*/15 * * * *' },
  removeOnComplete: true
});

/**
 * Worker to process recurring ranking & monetization tasks.
 * This ensures the "Marketplace" stays fresh and monetization is enforced.
 */
export const cronWorker = new Worker('cron-jobs', async (job) => {
  
  if (job.name === 'update-hot-scores') {
    console.log("🔄 Recalculating Hot Scores for recent media (Time-Decay Sorting)...");
    
    // Process media from the last 30 days only (optimization)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentMedia = await prisma.mediaAsset.findMany({
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        status: 'COMPLETED'
      },
      select: { id: true, upvotes: true, downvotes: true, createdAt: true }
    });

    console.log(`[Cron] Updating ${recentMedia.length} media assets.`);

    for (const media of recentMedia) {
      const newScore = calculateHotScore(media.upvotes, media.downvotes, media.createdAt);
      
      await prisma.mediaAsset.update({
        where: { id: media.id },
        data: { hotScore: newScore }
      });
    }
    
    console.log("✅ Hot Scores updated successfully.");
  }

  if (job.name === 'reset-expired-boosts') {
    console.log("🧹 Cleaning up expired profile boosts...");
    
    const now = new Date();
    
    // 1. Find and update database
    const expiredProfiles = await prisma.profile.findMany({
        where: {
            boostExpires: { lte: now },
            boostScore: { gt: 1.0 }
        },
        select: { id: true }
    });

    if (expiredProfiles.length > 0) {
        console.log(`[Cron] Resetting ${expiredProfiles.length} expired boosts.`);
        
        await prisma.profile.updateMany({
          where: {
            id: { in: expiredProfiles.map(p => p.id) }
          },
          data: {
            boostScore: 1.0, 
            boostExpires: null,
            isTopGirl: false
          }
        });

        // 2. Sync resets to Meilisearch
        try {
            const index = meiliClient.index('profiles');
            const updates = expiredProfiles.map(p => ({
                id: p.id,
                boostScore: 1.0,
                isTopGirl: false
            }));
            await index.addDocuments(updates);
            console.log("🚀 Meilisearch synced: Expired boosts removed from search ranking.");
        } catch (meiliErr) {
            console.error("❌ Failed to sync boost resets to Meilisearch:", meiliErr);
        }
    }
  }

  if (job.name === 'update-activity-scores') {
    console.log("📈 Recalculating Dynamic Activity Scores for all active profiles...");
    const { calculateActivityScore, calculateProfileCompleteness } = await import('../lib/algorithms/ranking');

    const activeProfiles = await prisma.profile.findMany({
      where: { isActive: true },
      include: { photos: { select: { id: true } } }
    });

    console.log(`[Cron] Updating scores for ${activeProfiles.length} profiles.`);

    for (const profile of activeProfiles) {
      const completeness = calculateProfileCompleteness(profile);
      const newScore = calculateActivityScore({
        lastActivityAt: profile.lastActivityAt,
        calendarUpdatedAt: profile.calendarUpdatedAt,
        averageResponseTime: profile.averageResponseTime,
        activeBoostUntil: profile.boostExpires, // Map boostExpires to check boost status
        profileCompleteness: completeness
      });

      // Update if changed
      if (newScore !== profile.activityScore) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { activityScore: newScore }
        });

        // Sync to Meilisearch
        await meiliClient.index('profiles').updateDocuments([{
          id: profile.id,
          activityScore: newScore
        }]);
      }
    }
    console.log("✅ Activity Scores updated and synced to Meilisearch.");
  }

}, { connection });
