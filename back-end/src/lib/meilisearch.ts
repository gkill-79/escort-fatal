import { MeiliSearch } from 'meilisearch';

// Initialize MeiliSearch client
// Ensure Meilisearch is running (default port 7700)
export const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'ton_api_key_master',
});

/**
 * Configure the 'profiles' index with filterable and sortable attributes.
 * This should be called during server initialization.
 */
export async function setupMeilisearch() {
  try {
    const index = meiliClient.index('profiles');
    
    // Define filterable attributes for faceted search and geo-search
    await index.updateFilterableAttributes([
      'city', 
      'status',      // e.g., 'APPROVED'
      'categories',  // e.g., ['TV/TS', 'Escort']
      'gender',
      'isOnline',    // For "Is Available Now"
      'priceFrom',   // For "Hourly Rate"
      '_geo'         // Virtual field for lat/lng (radius search)
    ]);
    
    // Define sortable attributes for monetization (Boost) and recency
    await index.updateSortableAttributes([
      'createdAt', 
      'updatedAt',
      'activityScore', // New dynamic ranking score
      'boostScore',
      'priceFrom',
      '_geo'
    ]);
    
    console.log("✅ Meilisearch Index 'profiles' configured successfully");
  } catch (error) {
    console.error("❌ Failed to setup Meilisearch index:", error);
  }
}

/**
 * Synchronize a single profile to Meilisearch.
 */
export async function syncProfileToMeili(profileId: string) {
  // Logic to fetch profile from Prisma and push to Meili
  // To be implemented in the sync service
}
