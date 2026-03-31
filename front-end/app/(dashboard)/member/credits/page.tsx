import { Coins, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/features/checkout/CheckoutButton";
import Link from "next/link";

export const metadata = {
  title: "Acheter des Crédits | Escorte Fatal",
};

export default function CreditsPage() {
  const packs = [
    { id: "pack_1", name: "Pack Découverte", credits: 50, price: 9.99, popular: false, description: "Idéal pour commencer." },
    { id: "pack_2", name: "Pack Premium", credits: 150, price: 24.99, popular: true, description: "Le meilleur rapport qualité/prix." },
    { id: "pack_3", name: "Pack Elite", credits: 500, price: 59.99, popular: false, description: "Pour une expérience sans limites." },
  ];

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Rechargez votre solde</h1>
        <p className="text-dark-400 text-lg">
          Utilisez vos crédits pour contacter vos escortes préférées et débloquer du contenu exclusif.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {packs.map((pack) => (
          <div 
            key={pack.id} 
            className={`relative flex flex-col bg-dark-800 border-2 rounded-3xl p-8 transition-all hover:scale-[1.02] ${
              pack.popular ? "border-brand-500 shadow-[0_0_30px_rgba(244,63,94,0.15)]" : "border-white/5"
            }`}
          >
            {pack.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-500 text-white px-4 py-1 text-xs font-black rounded-full uppercase flex items-center gap-1.5 ring-4 ring-dark-900">
                <Zap className="w-3 h-3 fill-white" />
                Le plus populaire
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-1">{pack.name}</h2>
              <p className="text-dark-400 text-sm">{pack.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black text-white tracking-tight">{pack.price}</span>
              <span className="text-xl font-bold text-dark-400">€</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-brand-500" />
                </div>
                <span className="font-bold text-lg">{pack.credits} Crédits</span>
              </div>
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <span>Accès instantané</span>
              </div>
            </div>

            <CheckoutButton 
               packId={pack.id}
               price={pack.price}
               credits={pack.credits}
               isPopular={pack.popular}
            />
          </div>
        ))}
      </div>

      <div className="mt-20 p-8 rounded-3xl bg-dark-800/50 border border-white/5 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center shrink-0">
          <Zap className="w-8 h-8 text-brand-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Besoin de plus de visibilité ?</h3>
          <p className="text-dark-400">
            En tant qu'escorte, vous pouvez utiliser vos crédits pour booster vos annonces et apparaître en haut des résultats de recherche.
          </p>
        </div>
        <Link href="/member/vip">
          <Button variant="outline" className="shrink-0 border-white/10 hover:bg-white/5">
            En savoir plus
          </Button>
        </Link>
      </div>
    </div>
  );
}
