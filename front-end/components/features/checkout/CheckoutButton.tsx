"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "react-hot-toast";

interface CheckoutButtonProps {
  productKey: string;
  label?: string;
  price?: string;
  variant?: "primary" | "outline" | "VIP";
}

export function CheckoutButton({ productKey, label = "Acheter", price, variant = "primary" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productKey }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      if (data.url) {
        window.location.href = data.url; // Redirect directly to Stripe
      }
    } catch (error: any) {
      toast.error(error.message, { style: { background: "#333", color: "#fff" } });
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "VIP": return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-none shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]";
      case "outline": return "bg-transparent border border-white/20 text-white hover:bg-white/5";
      default: return "bg-brand-500 hover:bg-brand-600 text-white border-none";
    }
  };

  return (
    <Button 
      fullWidth 
      onClick={handleCheckout} 
      disabled={loading}
      className={`${getVariantStyles()} transition-all font-bold h-12 flex items-center justify-between px-5`}
    >
      <div className="flex items-center gap-2">
         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
         <span>{loading ? "Redirection..." : label}</span>
      </div>
      {price && <span className="font-extrabold text-lg tracking-tight">{price}</span>}
    </Button>
  );
}
