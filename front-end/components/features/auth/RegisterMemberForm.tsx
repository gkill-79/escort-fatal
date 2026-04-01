"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterMemberFormValues>({
    resolver: zodResolver(registerMemberSchema),
  });

  const onSubmit = async (data: RegisterMemberFormValues) => {
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
          role: "MEMBER",
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
        {isLoading ? "Inscription..." : "S'inscrire"}
      </Button>

      <div className="text-center mt-4 text-sm text-dark-400">
        Déjà un compte ? <a href="/login" className="text-brand-400 hover:underline">Se connecter</a>
      </div>
    </form>
  );
}
