import { prisma } from "@/lib/prisma";

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

export type SearchProfileFilters = {
  cityId?: number;
  departmentId?: number;
  gender?: "FEMALE" | "MALE" | "TRANS" | "COUPLE" | string;
  isOnline?: boolean;
  minPrice?: number;
  maxPrice?: number;
  services?: string[];
  ageMin?: number;
  ageMax?: number;
  isTopGirl?: boolean;
  sort?: "newest" | "recommended";
};

export async function searchProfiles(filters: SearchProfileFilters, page = 1, limit = 24) {
  try {
    const where: any = {
      isApproved: true,
      isActive: true,
    };

    if (filters.cityId) where.cityId = filters.cityId;
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.gender) where.gender = filters.gender;
    if (filters.isOnline) where.isOnline = true;
    if (filters.isTopGirl) where.isTopGirl = true;
    
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.priceFrom = {};
      if (filters.minPrice !== undefined) where.priceFrom.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.priceFrom.lte = filters.maxPrice;
    }

    if (filters.ageMin !== undefined || filters.ageMax !== undefined) {
      where.age = {};
      if (filters.ageMin !== undefined) where.age.gte = filters.ageMin;
      if (filters.ageMax !== undefined) where.age.lte = filters.ageMax;
    }

    if (filters.services && filters.services.length > 0) {
      where.services = {
        some: {
          type: { in: filters.services },
        },
      };
    }

    const skip = (page - 1) * limit;

    let orderBy: any = [
      { boostScore: "desc" },
      { isTopGirl: "desc" },
      { lastOnlineAt: "desc" },
    ];
    
    if (filters.sort === "newest") {
      orderBy = [{ createdAt: "desc" }];
    }

    const [list, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          city: true,
          photos: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      items: list,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  } catch (error) {
    console.error("Error searching profiles:", error);
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
