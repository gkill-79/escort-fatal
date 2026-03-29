import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";

// 1. Configuration de l'ISR (Incremental Static Regeneration)
// La page est générée côté serveur et mise en cache pendant 1 heure
export const revalidate = 3600; 

interface Props {
  params: { city: string; category: string };
}

// 2. Génération dynamique des Meta Tags (Titre, Description) pour Google
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, category } = params;
  
  // Formatage propre (ex: "paris" -> "Paris", "bdsm" -> "BDSM")
  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const formattedCategory = category.toUpperCase();

  return {
    title: `Escorte ${formattedCategory} à ${formattedCity} - Rencontres Discrètes | Escorte Fatal`,
    description: `Découvrez les meilleures escortes ${formattedCategory} à ${formattedCity}. Profils 100% vérifiés, photos réelles, et mise en relation directe sur Escorte Fatal.`,
    alternates: {
      canonical: `https://votre-site.com/escortes/${city}/${category}`
    }
  };
}

export default async function ProgrammaticSeoPage({ params }: Props) {
  const { city, category } = params;
  
  // Appel à votre back-end pour récupérer les escortes spécifiques
  const escortes = await fetchApi(`/seo/search?city=${city}&category=${category}`);

  if (!escortes || escortes.length === 0) {
    // Si aucune escorte n'existe pour ce croisement, on retourne une 404
    notFound(); 
  }

  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);

  // 3. Injection du Schema.org (Breadcrumb et CollectionPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Escortes ${category} à ${formattedCity}`,
    "description": `Liste des escortes proposant la catégorie ${category} à ${formattedCity}.`,
    "url": `https://votre-site.com/escortes/${city}/${category}`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": escortes.map((escort: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://votre-site.com/escorts/${escort.slug}`
      }))
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1200px]">
      {/* Script JSON-LD injecté pour les robots de Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 className="text-3xl font-bold mb-4 text-white">
        Escortes {category} à {formattedCity}
      </h1>
      <p className="text-dark-300 mb-8">
        Explorez notre sélection premium. ({escortes.length} profils disponibles en ce moment).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {escortes.map((profile: any) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
}
