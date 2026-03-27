"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Zap, Loader2, ShieldCheck } from "lucide-react";

export default function MemberCreditsPage() {
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
         throw new Error(data.error || data.message || "Impossible d'initier le paiement.");
      }

      if (data.url) {
        window.location.href = data.url; // Redirige vers Stripe
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingProduct(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-6">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-white tracking-tight">Crédits de Messagerie</h1>
        <p className="text-dark-300 max-w-2xl mx-auto text-lg">
          Pour garantir des échanges de qualité et éliminer le spam, l'envoi de messages aux escortes requiert des crédits.
          <br/><span className="text-white font-medium">1 Crédit = 1 Message envoyé.</span> Les réponses des escortes sont gratuites.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center max-w-md mx-auto">
          {error}
        </div>
      )}

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-8">
        
        {/* PACK DE BASE */}
        <div className="bg-dark-900 border border-white/10 rounded-3xl p-8 relative flex flex-col hover:border-white/20 transition-all">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
            <MessageSquare className="w-7 h-7 text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Pack Starter</h2>
          <p className="text-dark-400 text-sm mb-6 flex-1">Parfait pour planifier un premier rendez-vous avec une escorte.</p>
          
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-4xl font-black text-white">4,90€</span>
            <span className="text-dark-400 font-medium">/ 10 Crédits</span>
          </div>

          <Button 
            className="w-full text-base font-bold" 
            size="lg"
            variant="outline"
            onClick={() => handleCheckout("CHAT_CREDITS_10")}
            disabled={loadingProduct === "CHAT_CREDITS_10"}
          >
            {loadingProduct === "CHAT_CREDITS_10" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acheter 10 Crédits"}
          </Button>
        </div>

        {/* PACK PREMIUM */}
        <div className="bg-gradient-to-br from-brand-900/40 to-dark-900 border border-brand-500/30 shadow-[0_0_40px_rgba(233,69,96,0.15)] rounded-3xl p-8 relative flex flex-col">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-brand-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Économique
            </div>
          </div>
          
          <div className="w-14 h-14 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="w-7 h-7 text-brand-400" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2">Pack Premium</h2>
          <p className="text-dark-300 text-sm mb-6 flex-1">L'idéal pour les utilisateurs réguliers. Discutez sans compter.</p>
          
          <div className="flex items-baseline gap-2 mb-8">
             <span className="text-4xl font-black text-white">19,90€</span>
             <span className="text-brand-400/80 font-medium line-through text-sm ml-2">24,50€</span>
             <span className="text-dark-400 font-medium ml-1">/ 50 Crédits</span>
          </div>

          <Button 
            className="w-full text-base font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-shadow" 
            size="lg"
            onClick={() => handleCheckout("CHAT_CREDITS_50")}
            disabled={loadingProduct === "CHAT_CREDITS_50"}
          >
            {loadingProduct === "CHAT_CREDITS_50" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Acheter 50 Crédits"}
          </Button>
        </div>

      </div>

      <div className="flex items-center justify-center gap-2 mt-12 text-dark-500 text-sm">
        <ShieldCheck className="w-4 h-4" />
        Paiement sécurisé crypté par Stripe
      </div>

    </div>
  );
}
