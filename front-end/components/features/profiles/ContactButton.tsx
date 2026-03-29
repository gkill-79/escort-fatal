"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Video, ShieldCheck, Loader2 } from "lucide-react";

interface ContactButtonProps {
  targetUserId: string;
}

export function ContactButton({ targetUserId }: ContactButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const startSecureChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": targetUserId }, // Simplification temporaire pour démo
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) throw new Error("Erreur de connexion");

      const data = await res.json();
      if (data.roomId) {
        router.push(`/dashboard/messages?room=${data.roomId}`);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors de l'ouverture de la discussion.");
    } finally {
      setLoading(false);
    }
  };

  const requestPrivateShow = () => {
    // Redirige vers la salle d'attente WebRTC avec intention de Cam
    router.push(`/chat/video/${targetUserId}?intent=private_show`);
  };

  return (
    <div className="flex flex-col space-y-3 w-full mt-6">
      <div className="flex items-center justify-center space-x-2 text-sm text-green-500 mb-2 font-medium bg-green-500/5 py-2 rounded-lg border border-green-500/10">
        <ShieldCheck className="w-4 h-4" />
        <span>Communication 100% Anonyme & Sécurisée</span>
      </div>

      <Button 
        onClick={startSecureChat}
        disabled={loading}
        className="w-full flex items-center justify-center bg-dark-800 text-white py-6 rounded-xl hover:bg-dark-700 transition shadow-xl font-bold border border-white/5 group"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageSquare className="w-5 h-5 mr-2 text-brand-400 group-hover:scale-110 transition-transform" />}
        {loading ? 'Connexion...' : 'Chat en direct'}
      </Button>

      <Button 
        onClick={requestPrivateShow}
        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-brand-500 text-white py-6 rounded-xl hover:opacity-90 transition shadow-xl font-bold border border-white/10 group active:scale-[0.98]"
      >
        <Video className="w-5 h-5 mr-2 group-hover:animate-pulse" />
        Demander un Show Privé Vidéo
      </Button>
      
      <p className="text-[10px] text-dark-500 text-center mt-2 leading-relaxed px-4">
        Aucun numéro de téléphone requis. Vos données ne quittent pas la plateforme.
        <br />Facturation à la minute (crédits chat requis).
      </p>
    </div>
  );
}
