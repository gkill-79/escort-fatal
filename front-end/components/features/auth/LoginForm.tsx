"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  identifier: z.string().min(1, "Veuillez entrer votre email ou pseudo"),
  password: z.string().min(1, "Veuillez entrer votre mot de passe"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Force router refresh to load session state properly
      router.refresh();
      // Redirect to home/dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Identifiants invalides");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Email ou Pseudo</label>
        <input
          {...register("identifier")}
          type="text"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="votre.email@exemple.com"
        />
        {errors.identifier && <p className="text-red-400 text-xs mt-1">{errors.identifier.message}</p>}
      </div>

      <div>
        <label className="block text-sm text-dark-300 font-medium mb-1.5">Mot de passe</label>
        <input
          {...register("password")}
          type="password"
          className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500"
          placeholder="••••••••"
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between mt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" className="rounded border-white/10 bg-dark-900 text-brand-500 focus:ring-brand-500" />
          <span className="text-sm text-dark-300 group-hover:text-white transition-colors">Se souvenir de moi</span>
        </label>
        <a href="#" className="text-sm text-brand-400 hover:text-brand-300 hover:underline">
          Mot de passe oublié ?
        </a>
      </div>

      <Button type="submit" fullWidth disabled={isLoading} className="mt-6">
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
      
    </form>
  );
}
