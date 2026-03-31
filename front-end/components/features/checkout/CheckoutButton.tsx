"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

interface CheckoutButtonProps {
  serviceId?: string;
  escortId: string;
  price: number;
  title: string;
}

export function CheckoutButton({ serviceId = "default-service", escortId, price, title }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          escortId,
          price,
          title,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Veuillez vous connecter pour réserver.");
          return;
        }
        throw new Error(data.error || "Une erreur est survenue lors de la réservation.");
      }
      
      // Redirect to Stripe or Success page simulation
      if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.success("Demande envoyée !");
      }
    } catch (error: any) {
      console.error("[CHECKOUT_BUTTON_ERROR]", error);
      toast.error(error.message || "Impossible de joindre le serveur de paiement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={onCheckout} 
      disabled={isLoading || !price}
      className="flex items-center justify-center gap-2 min-w-[140px]"
      variant="primary"
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {price ? `Réserver (${price}€)` : "Sur demande"}
    </Button>
  );
}
