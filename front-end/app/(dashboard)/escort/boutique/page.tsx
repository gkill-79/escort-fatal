import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Star, Zap, Crown } from "lucide-react";
import { CheckoutButton } from "@/components/features/checkout/CheckoutButton";
import { PRODUCTS } from "@/lib/stripe";

export const metadata = {
  title: "Boutique Premium — Escorte Fatal",
};

export default async function EscortBoutiquePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ESCORT") redirect("/member/dashboard");

  return (
    <div className="space-y-10 pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Boutique Premium</h1>
        <p className="text-dark-400 mt-2">
          Boostez votre profil pour capter l'attention de plus de membres et maximiser vos rendez-vous.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BOOST CARD */}
        <div className="bg-dark-900 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20" />
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
             <Zap className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Boost Visibilité</h2>
          <p className="text-dark-400 text-sm flex-1 leading-relaxed">
            Propulsez instantanément votre profil en tête de liste des recherches de votre ville. Idéal pour remplir un planning de dernière minute.
          </p>
          <div className="space-y-3 mt-8">
            <CheckoutButton 
               productKey="BOOST_7D" 
               label="7 Jours" 
               price="14.90€" 
               variant="outline"
            />
            <CheckoutButton 
               productKey="BOOST_30D" 
               label="30 Jours" 
               price="49.90€" 
               variant="primary"
            />
          </div>
        </div>

        {/* TOP GIRL CARD */}
        <div className="bg-dark-900 border border-yellow-500/30 rounded-3xl p-6 flex flex-col relative overflow-hidden group shadow-[0_0_30px_rgba(234,179,8,0.05)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-yellow-500/20" />
           <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Populaire</div>
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-yellow-500/20">
             <Star className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Top Girl Badge</h2>
          <p className="text-dark-400 text-sm flex-1 leading-relaxed">
            Obtenez le macaron très convoité "Top Girl". Inspirez confiance et différenciez-vous avec élégance sur la carte et les listes.
          </p>
          <div className="space-y-3 mt-8">
            <CheckoutButton 
               productKey="TOP_GIRL_7D" 
               label="7 Jours" 
               price="24.90€" 
               variant="outline"
            />
            <CheckoutButton 
               productKey="TOP_GIRL_30D" 
               label="30 Jours" 
               price="89.90€" 
               variant="VIP"
            />
          </div>
        </div>

        {/* EXCLUSIVE CARD */}
        <div className="bg-dark-900 border border-purple-500/30 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20" />
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
             <Crown className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Filtre Exclusif</h2>
          <p className="text-dark-400 text-sm flex-1 leading-relaxed">
            Affichez votre profil uniquement aux membres certifiés. Assure une discrétion totale et une clientèle très filtrée.
          </p>
          <div className="space-y-3 mt-8">
            <CheckoutButton 
               productKey="EXCLUSIVE_30D" 
               label="30 Jours" 
               price="149.90€" 
               variant="outline"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
