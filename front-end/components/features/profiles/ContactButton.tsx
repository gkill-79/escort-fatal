"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MessageCircle, Loader2 } from "lucide-react";

interface ContactButtonProps {
  targetUserId: string;
}

export function ContactButton({ targetUserId }: ContactButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContact = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        throw new Error("Erreur de connexion");
      }

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

  return (
    <Button 
      fullWidth 
      size="lg" 
      onClick={handleContact} 
      disabled={loading}
      className="bg-brand-500 hover:bg-brand-600 text-white shadow-[0_0_15px_rgba(233,69,96,0.2)] transition-all font-bold"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
      ) : (
        <MessageCircle className="w-5 h-5 mr-2" />
      )}
      {loading ? "Connexion sécurisée..." : "Envoyer un message"}
    </Button>
  );
}
