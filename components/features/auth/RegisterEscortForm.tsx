"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      gender: "FEMALE",
      cityId: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          role: "ESCORT",
          gender: data.gender,
          cityId: data.cityId ? parseInt(data.cityId, 10) : undefined,
        }),
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
        <h3 className="text-xl font-bold text-green-400 mb-2">Compte créé avec succès !</h3>
        <p className="text-dark-200">
          Vous allez être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        <input
          {...register("password")}
          type="password"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="8 caractères minimum"
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Confirmer le mot de passe</label>
        <input
          {...register("confirmPassword")}
          type="password"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="Retapez votre mot de passe"
        />
        {errors.confirmPassword && (
          <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
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
