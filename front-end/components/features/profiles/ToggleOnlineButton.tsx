"use client";
import { fetchApi } from "@/lib/api-client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function ToggleOnlineButton({ initialStatus }: { initialStatus: boolean }) {
  const { data: session } = useSession();
  const [isOnline, setIsOnline] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    if (!session || !(session as any).accessToken) {
      toast.error("Non authentifié");
      return;
    }

    try {
      setIsLoading(true);
      const newStatus = !isOnline;
      
      await fetchApi("/api/online/toggle", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${(session as any).accessToken}`
        },
        body: JSON.stringify({ isOnline: newStatus }),
      });

      setIsOnline(newStatus);
      toast.success(newStatus ? "Vous êtes maintenant en ligne" : "Vous êtes hors ligne");
    } catch (error: any) {
      toast.error(error.message || "Impossible de modifier le statut");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-dark-800/80 p-5 rounded-2xl border border-white/5 shadow-xl">
      <div className="flex-1">
        <h3 className="text-base font-bold text-white">Statut de disponibilité</h3>
        <p className="text-xs text-dark-500 mt-0.5">
          {isOnline 
            ? "Visible dans la liste 'En ligne maintenant'." 
            : "Masqué de la section 'En ligne'."}
        </p>
      </div>
      
      <Button 
        onClick={toggleStatus} 
        disabled={isLoading}
        variant={isOnline ? "primary" : "outline"}
        className={isOnline ? "bg-green-500 hover:bg-green-600 border-none min-w-[140px] text-white" : "min-w-[140px]"}
        size="md"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          isOnline ? "Mode En Ligne" : "Hors Ligne"
        )}
      </Button>
    </div>
  );
}
