import { Top100Gallery } from "@/components/features/media/Top100Gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 100 Photos Escorte Fatal - Les Plus Populaires",
  description: "Découvrez les photos les plus populaires de la plateforme Escorte Fatal, classées par notre algorithme de pertinence et de fraîcheur.",
};

export default function TopPhotosPage() {
  return (
    <main className="min-h-screen bg-dark-950 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 rounded-full border border-brand-500/20 mb-4 transition-all hover:bg-brand-500/20">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest leading-none">Algorithm V2.1 Hot-Score</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              Top 100 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">Photos</span>
            </h1>
            <p className="mt-4 text-dark-400 max-w-xl text-lg font-medium leading-relaxed">
              Le classement ultime des médias les plus engageants. La fraîcheur et l'interaction dictent la visibilité.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-dark-900/50 backdrop-blur-md p-2 rounded-2xl border border-white/5">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[10px] text-dark-500 font-bold uppercase tracking-wider mb-1">Mise à jour</p>
              <p className="text-sm text-white font-mono">Toutes les 60 min</p>
            </div>
            <div className="px-4 py-2 bg-brand-500/5 rounded-xl border border-brand-500/10">
              <p className="text-[10px] text-brand-500 font-bold uppercase tracking-wider mb-1">Algorithme</p>
              <p className="text-sm text-white font-mono">Time-Decay</p>
            </div>
          </div>
        </div>

        {/* GALLERY COMPONENT */}
        <Top100Gallery />

        {/* FOOTER INFO */}
        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-dark-900 to-dark-950 border border-white/5 text-center">
             <h2 className="text-2xl font-bold text-white mb-4">Comment augmenter votre Hot Score ?</h2>
             <p className="text-dark-400 max-w-2xl mx-auto mb-8">
               L'algorithme de classement prend en compte le nombre de votes positifs par rapport à l'âge du média. 
               Pour rester en tête, postez régulièrement de nouveaux contenus et achetez des <span className="text-brand-400 font-bold">Boosts</span> pour multiplier votre visibilité naturelle.
             </p>
             <button className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-all shadow-xl shadow-brand-500/20">
                Acheter des Crédits Boost
             </button>
        </div>
      </div>
    </main>
  );
}
