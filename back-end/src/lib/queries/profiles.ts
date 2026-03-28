import { prisma } from "../prisma";

const defaultStats = {
  totalProfiles: 15000,
  onlineCount: 2649,
  totalCities: 120,
};

export async function getSiteStats() {
  try {
    const [totalProfiles, onlineCount, totalCities] = await Promise.all([
      prisma.profile.count({ where: { isApproved: true, isActive: true } }),
      prisma.profile.count({ where: { isOnline: true, isApproved: true, isActive: true } }),
      prisma.city.count(),
    ]);
    return {
      totalProfiles: totalProfiles || defaultStats.totalProfiles,
      onlineCount: onlineCount || defaultStats.onlineCount,
      totalCities: totalCities || defaultStats.totalCities,
    };
  } catch {
    return defaultStats;
  }
}

export async function getTopGirls(limit: number) {
  try {
    const list = await prisma.profile.findMany({
    where: { isApproved: true, isActive: true, isTopGirl: true },
    take: limit,
    orderBy: { boostScore: "desc" },
    include: {
      city: true,
      photos: { where: { isPrimary: true }, take: 1 },
    },
  });
  return list;
  } catch {
    return [];
  }
}

export async function getOnlineProfiles(limit: number) {
  try {
    const list = await prisma.profile.findMany({
    where: { isApproved: true, isActive: true, isOnline: true },
    take: limit,
    orderBy: { lastOnlineAt: "desc" },
    include: {
      city: true,
      photos: { where: { isPrimary: true }, take: 1 },
    },
  });
  return list;
  } catch {
    return [];
  }
}

export async function getNewProfiles(limit: number) {
  try {
    const list = await prisma.profile.findMany({
    where: { isApproved: true, isActive: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      city: true,
      photos: { where: { isPrimary: true }, take: 1 },
    },
  });
  return list;
  } catch {
    return [];
  }
}

import { meiliClient } from '../meilisearch';

export type SearchProfileFilters = {
  city?: string;
  departmentId?: number;
  gender?: string;
  category?: string;
  isOnline?: boolean;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radiusInMeters?: number;
  sort?: "newest" | "recommended";
};

export async function searchProfiles(filters: SearchProfileFilters, page = 1, limit = 24) {
  try {
    const index = meiliClient.index('profiles');
    const meiliFilters: string[] = [];

    // Map filters to Meilisearch index attributes
    if (filters.city) meiliFilters.push(`city = '${filters.city}'`);
    if (filters.gender) meiliFilters.push(`gender = '${filters.gender}'`);
    if (filters.category) meiliFilters.push(`categories = '${filters.category}'`);
    if (filters.isOnline) meiliFilters.push(`status = 'ONLINE'`);
    
    // Geospatial filtering (_geoRadius support)
    if (filters.lat && filters.lng && filters.radiusInMeters) {
      meiliFilters.push(`_geoRadius(${filters.lat}, ${filters.lng}, ${filters.radiusInMeters})`);
    }

    // Execution of the search query
    const searchResults = await index.search('', {
      filter: meiliFilters.length > 0 ? meiliFilters : undefined,
      sort: filters.sort === "newest" ? ['createdAt:desc'] : ['boostScore:desc', 'createdAt:desc'],
      hitsPerPage: limit,
      page: page,
    });

    return {
      items: searchResults.hits,
      total: searchResults.totalHits,
      page: searchResults.page,
      totalPages: searchResults.totalPages,
      hasMore: searchResults.page < searchResults.totalPages,
    };
  } catch (error) {
    console.error("Meilisearch Error, falling back to basic result:", error);
    // Return empty result or trigger Prisma fallback here
    return {
      items: [],
      total: 0,
      page,
      totalPages: 0,
      hasMore: false,
    };
  }
}

export async function getProfileBySlug(slug: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { slug },
      include: {
        city: true,
        department: true,
        photos: {
          orderBy: { order: "asc" }
        },
        videos: true,
        services: true,
        availability: true,
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, username: true, role: true, avatarUrl: true } }
          }
        }
      },
    });

    if (!profile || (!profile.isActive && profile.slug !== slug)) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error("Error fetching profile by slug:", error);
    return null;
  }
}
