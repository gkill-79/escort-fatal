import { Metadata } from "next";
import Link from "next/link";
import { Flame, User, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Créer un compte — Escorte Fatal",
  description: "Choisissez votre type de compte pour rejoindre la communauté.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,100,100,0.05)_0%,transparent_50%)]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <Flame className="w-10 h-10 text-brand-500" />
            <span className="font-display font-black text-2xl tracking-tighter text-white">
              ESCORTE<span className="text-brand-500">FATAL</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-col space-y-2 text-center mt-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Créer un compte
          </h1>
          <p className="text-sm text-dark-300">
            Choisissez votre type de compte pour continuer
          </p>
        </div>
        
        <div className="mt-8 bg-dark-900 border border-white/10 p-6 rounded-3xl shadow-2xl grid gap-4 relative z-10">
          <Link href="/register/member" className="w-full group">
            <button className="flex items-center justify-between w-full p-4 border border-white/5 rounded-2xl bg-dark-950 hover:border-brand-500 hover:bg-brand-500/10 transition-all text-left">
               <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                     <User className="w-5 h-5 text-brand-500" />
                     Je suis un Membre
                  </h3>
                  <p className="text-sm text-dark-400 mt-1">
                     Réservez, consultez des profils et laissez des avis.
                  </p>
               </div>
            </button>
          </Link>
          <Link href="/register/escort" className="w-full group">
            <button className="flex items-center justify-between w-full p-4 border border-white/5 rounded-2xl bg-dark-950 hover:border-brand-500 hover:bg-brand-500/10 transition-all text-left">
               <div>
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                     <Heart className="w-5 h-5 text-brand-500" />
                     Je suis une Escorte
                  </h3>
                  <p className="text-sm text-dark-400 mt-1">
                     Publiez une annonce et trouvez de nouveaux clients.
                  </p>
               </div>
            </button>
          </Link>

          <p className="pt-4 text-center text-sm text-dark-400">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-brand-500 underline underline-offset-4 hover:text-brand-400 transition-colors">
               Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
