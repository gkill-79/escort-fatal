import { Metadata } from "next";
import Link from "next/link";
import { RegisterMemberForm } from "@/components/features/auth/RegisterMemberForm";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Inscription Membre — Escorte Fatal",
  description: "Rejoignez la plus grande communauté pour des rencontres inoubliables.",
};

export default function RegisterMemberPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,57,70,0.1)_0%,transparent_50%)]" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Flame className="w-10 h-10 text-brand-500" />
            <span className="font-display font-black text-2xl tracking-tighter text-white">
              ESCORTE<span className="text-brand-500">FATAL</span>
            </span>
          </Link>
        </div>
        
        <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
          Créer un compte membre
        </h2>
        <p className="mt-2 text-center text-sm text-dark-300">
          Vous êtes professionnelle ?{" "}
          <Link href="/register/escort" className="font-medium text-brand-400 hover:text-brand-300 transition-colors">
            Publier une annonce
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-dark-800/80 border border-white/5 py-8 px-4 shadow sm:rounded-3xl sm:px-10 backdrop-blur-sm">
          <RegisterMemberForm />
        </div>
      </div>
    </div>
  );
}
