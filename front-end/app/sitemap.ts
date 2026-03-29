import { MetadataRoute } from 'next'
import { fetchApi } from "@/lib/api-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://votre-site.com'; // TODO: Remplacer par ton vrai nom de domaine en production

  // 1. Récupérer toutes les villes et catégories actives depuis l'API, les erreurs n'interrompent pas la compilation
  let cities: any[] = [];
  let categories: any[] = [];
  let profiles: any[] = [];

  try {
    const data = await Promise.all([
      fetchApi('/seo/active-cities'),
      fetchApi('/seo/active-categories'),
      fetchApi('/seo/profiles-slugs')
    ]).catch(() => [[], [], []]); // On ne bloque pas si le serveur n'est pas encore prêt
    
    cities = data[0] || [];
    categories = data[1] || [];
    profiles = data[2] || [];
  } catch(e) {}

  // 2. Pages statiques
  const staticRoutes = ['', '/escorts', '/all-cities', '/radar'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. Pages Profils
  const profileRoutes = profiles.map((profile: any) => ({
    url: `${baseUrl}/escorts/${profile.slug}`,
    lastModified: new Date(profile.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // 4. Programmatique (Villes x Catégories) - ex: /escortes/paris/bdsm
  const programmaticRoutes: any[] = [];
  cities.forEach((city: string) => {
    categories.forEach((category: string) => {
      programmaticRoutes.push({
        url: `${baseUrl}/escortes/${city.toLowerCase()}/${category.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      });
    });
  });

  return [...staticRoutes, ...profileRoutes, ...programmaticRoutes];
}
