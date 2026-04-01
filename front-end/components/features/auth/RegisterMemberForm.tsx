"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import { SelfieCapture } from "./SelfieCapture";

const registerMemberSchema = z
  .object({
    username: z.string().min(3, "Le pseudo doit contenir au moins 3 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterMemberFormValues = z.infer<typeof registerMemberSchema>;

export function RegisterMemberForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterMemberFormValues>({
    resolver: zodResolver(registerMemberSchema),
  });

  const onSubmit = async (data: RegisterMemberFormValues) => {
    if (!selfie || !idCard) {
      setError("La pièce d'identité et le selfie sont obligatoires pour certifier votre compte membre.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", "MEMBER");
      formData.append("selfie", selfie);
      formData.append("idCard", idCard);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Une erreur est survenue");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login"); // Assume there's a /login page
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-green-400 mb-2">Bienvenue sur Escorte Fatal !</h3>
        <p className="text-dark-200">
          Votre compte membre a été créé avec succès. Vous allez être redirigé vers la connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-2xl font-bold text-center text-white mb-2 hidden">Créer un compte membre</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Pseudo public</label>
        <input
          {...register("username")}
          type="text"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="Votre pseudo (celui-ci apparaitra dans vos avis)"
        />
        {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="email@exemple.com"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Mot de passe</label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-brand-500"
            placeholder="8 caractères minimum"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Confirmer le mot de passe</label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showPassword ? "text" : "password"}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-brand-500"
            placeholder="Retapez votre mot de passe"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="border-t border-white/10 pt-6 mt-6">
        <h3 className="text-lg font-bold text-brand-400 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
          Vérification d'Identité (Sécurisé & Confidentiel)
        </h3>
        <p className="text-xs text-dark-400 mb-4 italic">
          Ce processus garantit la qualité de la plateforme et empêche les faux comptes. Vos documents sont traités de manière strictement sécurisée.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-2">Pièce d'identité (Recto/Verso)</label>
            <div className="relative group">
              <input
                type="file"
                id="idCard"
                accept="image/*,.pdf"
                onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label 
                htmlFor="idCard"
                className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all bg-white/5"
              >
                <span className="text-xs text-brand-400 font-bold mb-1">
                  {idCard ? "Document ajouté" : "Cliquez pour uploader"}
                </span>
                <span className="text-xs text-dark-400">
                  {idCard ? idCard.name : "(PDF/Image)"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-dark-300 font-medium mb-2">Selfie (Liveness)</label>
            <SelfieCapture onCapture={(file) => setSelfie(file)} />
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth className="mt-2" disabled={isLoading}>
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>

      <div className="text-center mt-4 text-sm text-dark-400">
        Déjà un compte ? <a href="/login" className="text-brand-400 hover:underline">Se connecter</a>
      </div>
    </form>
  );
}
