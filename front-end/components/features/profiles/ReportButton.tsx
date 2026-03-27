"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

const REASONS = ["Faux profil", "Photos volées", "Services illégaux", "Mineur(e)", "Arnaque", "Autre"];

export default function ReportButton({ profileId }: { profileId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({ profileId, reason, details }),
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => setIsOpen(false), 3000);
      } else {
        alert("Erreur");
        setStatus("idle");
      }
    } catch (error) {
      alert("Erreur réseau");
      setStatus("idle");
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="text-slate-500 hover:text-red-500 flex items-center text-sm font-medium mt-8">
      <AlertTriangle className="w-4 h-4 mr-2" /> Signaler ce profil
    </button>
  );

  return (
    <div className="mt-8 bg-slate-900 border border-red-500/30 p-4 rounded-xl">
      <h4 className="text-red-400 font-bold mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> Signaler le profil</h4>
      {status === "success" ? <p className="text-emerald-500">Merci, signalement envoyé.</p> : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full bg-slate-800 text-white rounded p-2 outline-none">
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} className="w-full bg-slate-800 text-white rounded p-2 min-h-[80px]" placeholder="Détails (optionnel)" />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={status === "loading"} className="bg-red-500 text-white">Envoyer</Button>
          </div>
        </form>
      )}
    </div>
  );
}
