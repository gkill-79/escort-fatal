import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="space-y-2">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold text-white tracking-tight">Réservation confirmée !</h1>
      </div>
      
      <p className="text-dark-300 max-w-md text-lg leading-relaxed">
        Votre paiement a bien été traité avec succès. L&apos;escorte a été immédiatement notifiée de votre réservation.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center w-full max-w-sm">
        <Link href="/dashboard" className="flex-1">
          <Button variant="secondary" fullWidth>
            Mon Tableau de bord
          </Button>
        </Link>
        <Link href="/messages" className="flex-1">
          <Button fullWidth>
            Envoyer un message
          </Button>
        </Link>
      </div>

      <p className="text-dark-500 text-sm pt-8">
        Un reçu vous a été envoyé par email.
      </p>
    </div>
  );
}
