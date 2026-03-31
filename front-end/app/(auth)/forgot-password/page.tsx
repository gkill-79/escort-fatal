"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-dark-900 border border-white/5 rounded-2xl shadow-2xl">
      <Link href="/login" className="inline-flex items-center text-sm text-dark-300 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à la connexion
      </Link>

      <h1 className="text-2xl font-bold mb-2 text-white">Mot de passe oublié</h1>
      <p className="text-dark-300 mb-6 text-sm">
        Entrez votre adresse email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      {status === "success" ? (
        <div className="bg-brand-500/10 border border-brand-500/50 text-brand-400 p-4 rounded-xl text-sm flex items-start">
          <Mail className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p>Si un compte est associé à cet email, un lien de réinitialisation vous a été envoyé.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-dark-200">Email</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
              placeholder="votre@email.com"
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">Une erreur est survenue. Veuillez réessayer.</p>
          )}

          <Button type="submit" fullWidth disabled={status === "loading"} className="mt-2">
            {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
          </Button>
        </form>
      )}
    </div>
  );
}
