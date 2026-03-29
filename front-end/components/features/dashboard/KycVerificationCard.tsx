"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import { fetchApi } from "@/lib/api-client";

interface KycVerificationCardProps {
  profile: {
    kycStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "REQUIRES_MANUAL_REVIEW";
    biometricVerified: boolean;
  };
}

export function KycVerificationCard({ profile }: KycVerificationCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startKycProcess = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi("/kyc/start", { method: "POST" });
      if (data.url) {
        window.location.href = data.url; // Redirige vers le tunnel sécurisé du prestataire IDCheck / IDNow
      } else {
        setError("Impossible de générer la session de vérification.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-800/80 border border-white/5 shadow-sm rounded-2xl p-6 md:p-8 backdrop-blur-sm mt-6">
      <h2 className="text-xl font-bold text-white mb-4">Vérification d'Identité (Trust & Safety)</h2>
      
      {profile.kycStatus === 'APPROVED' ? (
        <div className="text-green-500 font-medium flex items-center bg-green-500/10 px-4 py-3 rounded-xl border border-green-500/20">
          <ShieldCheckIcon className="w-6 h-6 mr-3 text-green-400" />
          Félicitations ! Votre profil possède le badge "Vérifié par biométrie".
        </div>
      ) : (
        <div>
          <p className="text-dark-300 mb-6 leading-relaxed">
            Obtenez le badge <strong className="text-white">Profil 100% Vérifié</strong> pour doubler vos vues et rassurer vos clients. Préparez votre pièce d'identité et activez votre caméra (processus sécurisé par IDNow / IDCheck.io).
          </p>
          
          {profile.kycStatus === 'REJECTED' && (
            <div className="text-red-400 mb-4 bg-red-400/10 px-4 py-2 rounded-lg text-sm border border-red-400/20">
              ⚠️ Votre précédente tentative de vérification a échoué. Veuillez réessayer.
            </div>
          )}

          {error && (
            <div className="text-red-400 mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <button 
            onClick={startKycProcess}
            className="bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto flex justify-center items-center"
            disabled={profile.kycStatus === 'PENDING' || loading}
          >
            {profile.kycStatus === 'PENDING' ? (
              '⏳ Vérification en cours d\'analyse...'
            ) : loading ? (
              'Ouverture du flux sécurisé...'
            ) : (
              'Lancer la vérification (3 min)'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
