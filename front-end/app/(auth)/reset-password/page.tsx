"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  if (!token) {
    return <div className="text-center text-red-400 p-6 bg-red-500/10 rounded-xl border border-red-500/20">Lien invalide ou expiré.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-green-400">Mot de passe réinitialisé !</h2>
        <p className="text-dark-300 text-sm">Vous allez être redirigé vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-dark-200">Nouveau mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-dark-200">Confirmer le mot de passe</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-dark-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
        />
      </div>

      {status === "error" && <p className="text-red-400 text-sm">Le lien est invalide ou a expiré.</p>}

      <Button type="submit" fullWidth disabled={status === "loading"} className="mt-2">
        {status === "loading" ? "Mise à jour..." : "Réinitialiser"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-dark-900 border border-white/5 rounded-2xl shadow-2xl mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Nouveau mot de passe</h1>
      <Suspense fallback={<div className="text-center text-dark-400">Chargement...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
