import { fetchApi } from "@/lib/api-client";

export async function getPopularCities(limit: number) {
  try {
    return await fetchApi(`/cities/popular?limit=${limit}`);
  } catch (error) {
    console.error("Erreur lors de la récupération des villes:", error);
    return [];
  }
}
