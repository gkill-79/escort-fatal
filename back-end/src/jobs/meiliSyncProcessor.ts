import { Worker, Queue } from 'bullmq';
import { prisma } from '../lib/prisma';
import { meiliClient } from '../lib/meilisearch';
import { redis as redisConnection } from '../lib/redis';

// 1. Création de la file d'attente
export const meiliSyncQueue = new Queue('meili-sync-queue', { connection: redisConnection });

// 2. Le Worker qui traite la file
const meiliWorker = new Worker('meili-sync-queue', async (job) => {
  const { profileId, action } = job.data;

  try {
    if (action === 'DELETE') {
      await meiliClient.index('profiles').deleteDocument(profileId);
      console.log(`🗑️ Profil ${profileId} supprimé de Meilisearch`);
      return;
    }

    // Action CREATE ou UPDATE
    // On récupère les données fraîches depuis PostgreSQL
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        city: true // Included to get fallback lat/lon if profile doesn't have it
      }
    });

    if (!profile) return;

    // Default to city lat/lon if profile specific lat/lon is missing
    const lat = profile.latitude ?? profile.city?.lat ?? 0;
    const lng = profile.longitude ?? profile.city?.lon ?? 0;

    // 3. Formatage Spécifique pour Meilisearch
    const meiliDocument = {
      id: profile.id,
      name: profile.name,
      slug: profile.slug,
      city: profile.city?.name || '',
      categories: profile.categories,
      gender: profile.gender,
      boostScore: profile.boostScore || 1.0,
      isOnline: profile.isOnline || false,
      priceFrom: profile.priceFrom,
      ratingAvg: profile.ratingAvg,
      isTopGirl: profile.isTopGirl,
      
      // Le composant magique pour le Radar
      _geo: { lat, lng },
      
      updatedAt: profile.updatedAt.getTime() // Timestamp pour le tri de nouveauté
    };

    // 4. Envoi au moteur de recherche
    await meiliClient.index('profiles').addDocuments([meiliDocument]);
    console.log(`⚡ Profil ${profile.name} synchronisé sur Meilisearch`);
  } catch (error) {
    console.error(`Erreur de synchronisation MeiliSearch pour le profil ${profileId}:`, error);
  }

}, { connection: redisConnection });

export default meiliWorker;
