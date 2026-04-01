"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api-client";
import { Eye, EyeOff } from "lucide-react";

// Assuming a basic Input component exists or we can just use standard HTML inputs styled with Tailwind
// We'll use standard inputs for simplicity and robustness if a custom one isn't fully robust.

const registerSchema = z
  .object({
    username: z.string().min(3, "Le pseudo doit contenir au moins 3 caractères"),
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    gender: z.enum(["FEMALE", "MALE", "TRANS", "COUPLE"], {
      required_error: "Veuillez sélectionner un genre",
    }),
    cityId: z.string().optional(),
    // KYC 2257
    realName: z.string().min(3, "Le nom légal est requis"),
    dateOfBirth: z.string().min(1, "La date de naissance est requise"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterEscortForm({ cities }: { cities: { id: number; name: string }[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [idDocumentFront, setIdDocumentFront] = useState<File | null>(null);
  const [liveSelfie, setLiveSelfie] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "FEMALE",
      cityId: "",
      realName: "",
      dateOfBirth: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!idDocumentFront || !liveSelfie) {
        throw new Error("Veuillez télécharger votre pièce d'identité et votre selfie");
      }

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("username", data.username);
      formData.append("gender", data.gender);
      if (data.cityId) formData.append("cityId", data.cityId);
      
      // 2257 Data
      formData.append("realName", data.realName);
      formData.append("dateOfBirth", data.dateOfBirth);
      
      // Biometrics
      formData.append("idDocument", idDocumentFront);
      formData.append("liveSelfie", liveSelfie);

      const res = await fetch("/api/auth/register-escort", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Une erreur est survenue lors de l'inscription KYC");
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard?kyc=pending");
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
        <h3 className="text-xl font-bold text-green-400 mb-2">Compte créé avec succès !</h3>
        <p className="text-dark-200">
          Vous allez être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-2xl font-extrabold text-center text-white mb-6">Ouvrir un compte escorte</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Username */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Pseudo (Nom public)</label>
        <input
          {...register("username")}
          type="text"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="Votre pseudo sexy"
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

      <div className="grid grid-cols-2 gap-4">
        {/* Gender */}
        <div>
          <label className="block text-sm text-dark-300 font-medium mb-1.5">Genre</label>
          <select
            {...register("gender")}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="FEMALE">Femme</option>
            <option value="MALE">Homme</option>
            <option value="TRANS">Transgenre</option>
            <option value="COUPLE">Couple</option>
          </select>
          {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender.message}</p>}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm text-dark-300 font-medium mb-1.5">Ville Principale (Optionnel)</label>
          <select
            {...register("cityId")}
            className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">Sélectionnez...</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
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
          Vérification Légale (Chiffré & Confidentiel)
        </h3>
        <p className="text-xs text-dark-400 mb-4 italic">
          Conformité stricte au 18 U.S.C. § 2257. Ces données sont stockées dans une chambre forte chiffrée.
        </p>

        <div className="space-y-4">
          {/* Real Name */}
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Nom Légal Complet</label>
            <input
              {...register("realName")}
              type="text"
              className="w-full bg-dark-900 border border-brand-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
              placeholder="Prénom et Nom de famille"
            />
            {errors.realName && <p className="text-red-400 text-xs mt-1">{errors.realName.message}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm text-dark-300 font-medium mb-1.5">Date de Naissance</label>
            <input
              {...register("dateOfBirth")}
              type="date"
              className="w-full bg-dark-900 border border-brand-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
            />
            {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>

          {/* ID Document */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dark-300 font-medium mb-2">Pièce d'identité</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdDocumentFront(e.target.files?.[0] || null)}
                  className="hidden"
                  id="id-upload"
                />
                <label 
                  htmlFor="id-upload"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all bg-white/5"
                >
                  <span className="text-xs text-dark-400">{idDocumentFront ? idDocumentFront.name : "Choisir un fichier"}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-300 font-medium mb-2">Selfie (Liveness)</label>
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => setLiveSelfie(e.target.files?.[0] || null)}
                  className="hidden"
                  id="selfie-upload"
                />
                <label 
                  htmlFor="selfie-upload"
                  className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all bg-white/5"
                >
                  <span className="text-xs text-dark-400">{liveSelfie ? liveSelfie.name : "Prendre un selfie"}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" fullWidth className="mt-2" disabled={isLoading}>
        {isLoading ? "Création en cours..." : "Créer mon profil Escorte"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-dark-400 text-sm">
          En vous inscrivant, vous acceptez nos <a href="#" className="text-brand-400 hover:underline">conditions d&apos;utilisation</a>.
        </p>
      </div>
    </form>
  );
}
