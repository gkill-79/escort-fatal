"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Zap, Crown, Loader2 } from "lucide-react";

export default function BillingPage() {
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (productKey: string) => {
    setLoadingProduct(productKey);
    setError(null);

    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Impossible d'initier le paiement.");
      }

      if (data.url) {
        window.location.href = data.url; // Rediriger vers Stripe
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingProduct(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Boosts & Abonnements</h1>
        <p className="text-dark-400 mt-1">Augmentez votre visibilité et attirez plus de membres qualifiés.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Plans Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* TOP GIRL Card */}
        <div className="bg-gradient-to-br from-brand-900/40 to-dark-900 border border-brand-500/30 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(233,69,96,0.15)]">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Recommandé
            </div>
          </div>
          
          <Crown className="w-12 h-12 text-brand-400 mb-6" />
          <h2 className="text-2xl font-black text-white mb-2">Label Top Girl</h2>
          <p className="text-dark-300 text-sm mb-6 h-10">L&apos;ultime garantie pour votre profil. Plus de vues, priorité dans les résultats et badge certifié.</p>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-black text-white">99€</span>
            <span className="text-dark-400 font-medium">/ 30 jours</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="text-dark-200 text-sm">Badge doré "Top Girl" visible partout</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="text-dark-200 text-sm">Remontée en haut des recherches</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="text-dark-200 text-sm">Apparition sur la page d&apos;accueil</span>
            </li>
          </ul>

          <Button 
            className="w-full text-base font-bold shadow-lg" 
            size="lg"
            onClick={() => handleCheckout("TOP_GIRL_30D")}
            disabled={loadingProduct === "TOP_GIRL_30D"}
          >
            {loadingProduct === "TOP_GIRL_30D" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Devenir Top Girl"}
          </Button>
        </div>

        {/* BOOST Temporary Card */}
        <div className="bg-dark-800 border border-white/10 rounded-3xl p-8 relative flex flex-col">
          <Zap className="w-12 h-12 text-yellow-400 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Boost Instantané</h2>
          <p className="text-dark-300 text-sm mb-6 h-10">Un coup de pouce puissant et temporaire pour dominer votre ville pendant la semaine.</p>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-bold text-white">15€</span>
            <span className="text-dark-400 font-medium">/ 7 jours</span>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-dark-200 text-sm">Profil mis en avant</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-dark-200 text-sm">Priorité dans les résultats locaux</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0" />
              <span className="text-dark-200 text-sm">Aucun abonnement récurrent</span>
            </li>
          </ul>

          <Button 
            variant="outline"
            className="w-full hover:bg-yellow-500/10 hover:text-yellow-400 border-white/10 hover:border-yellow-500/30 text-base" 
            size="lg"
            onClick={() => handleCheckout("BOOST_7D")}
            disabled={loadingProduct === "BOOST_7D"}
          >
             {loadingProduct === "BOOST_7D" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activer le Boost 7h"}
          </Button>
        </div>

      </div>
    </div>
  );
}
