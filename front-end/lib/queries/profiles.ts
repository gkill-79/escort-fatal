import { fetchApi } from "@/lib/api-client";

const defaultStats = {
  totalProfiles: 15000,
  onlineCount: 2649,
  totalCities: 120,
};

export async function getSiteStats() {
  try {
    return await fetchApi("/v2/profiles/stats");
  } catch {
    return defaultStats;
  }
}

export async function getTopGirls(limit: number) {
  try {
    return await fetchApi(`/v2/profiles/top?limit=${limit}`);
  } catch {
    return [];
  }
}

export async function getOnlineProfiles(limit: number) {
  try {
    return await fetchApi(`/v2/profiles/online?limit=${limit}`);
  } catch {
    return [];
  }
}

export async function getNewProfiles(limit: number) {
  try {
    return await fetchApi(`/v2/profiles/new?limit=${limit}`);
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
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters as any
    });
    return await fetchApi(`/v2/profiles/search?${params.toString()}`);
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
    return await fetchApi(`/v2/profiles/slug/${slug}`);
  } catch (error) {
    console.error("Error fetching profile by slug:", error);
    return null;
  }
}
