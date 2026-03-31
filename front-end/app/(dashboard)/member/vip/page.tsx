import { Zap, Check, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata = {
  title: "Abonnements VIP | Escorte Fatal",
};

export default function VipPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/member/credits" 
          className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Retour aux crédits
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            Abonnements VIP
          </h1>
          <p className="text-dark-400 text-lg max-w-2xl">
            Obtenez plus de visibilité, débloquez des fonctionnalités exclusives et démarquez-vous des autres membres avec nos offres VIP.
          </p>
        </div>

        <div className="bg-dark-800 border-2 border-white/5 rounded-3xl p-12 text-center relative overflow-hidden">
          {/* Decorative background blast */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Zap className="w-10 h-10 text-brand-500" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-4">Fonctionnalité en cours de développement</h2>
            <p className="text-dark-400 mb-8 leading-relaxed">
              Nous préparons des offres incroyables pour vous offrir une visibilité maximale sur la plateforme. Les packs VIP incluront le badge "Premium", la mise en avant dans les résultats et bien plus encore.
            </p>
            
            <Link href="/member/credits">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 px-8">
                Revenir aux crédits
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <Check className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Badge Vérifié</h3>
              <p className="text-sm text-dark-400">Gagnez la confiance des utilisateurs avec un badge distinctif sur votre profil.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <Check className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Priorité Affichage</h3>
              <p className="text-sm text-dark-400">Apparaissez toujours en tête de liste dans votre ville et votre catégorie.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
