import { fetchApi } from "@/lib/api-client";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";
import { Star } from "lucide-react";

export const metadata = {
  title: "Annonces | Escorte Fatal",
  description: "Découvrez les dernières annonces et profils disponibles.",
};

export default async function AnnoncesPage() {
  let escorts: any[] = [];
  try {
    escorts = await fetchApi("/v2/profiles/latest");
  } catch (error) {
    console.error("Error fetching latest announcements:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Dernières Annonces</h1>
        <p className="text-dark-400 text-lg">Trouvez la personne qui correspond à vos attentes.</p>
        <div className="h-1.5 w-20 bg-brand-500 rounded-full mt-4" />
      </div>

      {escorts.length === 0 ? (
        <div className="text-center py-20 bg-dark-800/50 border border-white/5 rounded-3xl">
          <Star className="w-12 h-12 mx-auto text-dark-600 mb-4" />
          <p className="text-dark-300 text-xl font-medium">Aucune annonce n'est disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {escorts.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
