"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Euro, CreditCard } from "lucide-react";

const PACKS = [
  { id: "pack_small", credits: 100, price: 10, label: "Basique", description: "Idéal pour commencer" },
  { id: "pack_medium", credits: 500, price: 45, label: "Populaire", description: "Le meilleur rapport qualité/prix" },
];

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (packId: string, price: number, credits: number) => {
    setLoading(packId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, price, credits })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur lors de la création de la session de paiement");
        setLoading(null);
      }
    } catch (error) {
      console.error("[CHECKOUT_ERROR]", error);
      alert("Erreur réseau");
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4">Acheter des Crédits</h1>
        <p className="text-slate-400 text-lg">Débloquez du contenu exclusif et envoyez des messages illimités.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {PACKS.map((pkg) => (
          <div key={pkg.id} className="relative bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors rounded-3xl p-8 flex flex-col items-center group">
            {pkg.id === "pack_medium" && (
              <span className="absolute -top-4 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Recommandé</span>
            )}
            <h3 className="text-xl font-bold text-slate-400 mb-2">{pkg.label}</h3>
            <p className="text-5xl font-black text-amber-500 mb-4">{pkg.credits} <span className="text-xl text-slate-500 font-medium">pts</span></p>
            <p className="text-slate-400 mb-8 text-center">{pkg.description}</p>
            
            <div className="w-full mt-auto">
              <Button 
                onClick={() => handleCheckout(pkg.id, pkg.price, pkg.credits)} 
                disabled={loading !== null}
                className="w-full py-6 bg-amber-500 text-slate-950 font-bold text-lg hover:bg-amber-400 rounded-2xl flex items-center justify-center gap-2"
              >
                {loading === pkg.id ? (
                  "Chargement..."
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Payer {pkg.price} €
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-start gap-4">
        <div className="bg-emerald-500/10 p-2 rounded-lg">
          <Euro className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h4 className="text-white font-bold mb-1">Paiement sécurisé via Stripe</h4>
          <p className="text-slate-500 text-sm">Vos transactions sont chiffrées et sécurisées. Vos informations bancaires ne sont jamais stockées sur nos serveurs.</p>
        </div>
      </div>
    </div>
  );
}
